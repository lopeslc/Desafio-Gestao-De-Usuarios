using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Data.SqlClient;                // <- necessário para os métodos de reset
using Projeto.Core;

namespace Projeto.Infra;

public class AuthService : IAuthService
{
    private readonly IUserRepo _repo;
    private readonly IConfiguration _cfg;
    private readonly string _connStr;

    public AuthService(IUserRepo repo, IConfiguration cfg)
    {
        _repo = repo;
        _cfg = cfg;
        // usa a mesma connection string já configurada no appsettings.json
        _connStr = _cfg.GetConnectionString("Sql")!;
    }

    public async Task<string?> LoginAsync(string email, string senha)
    {
        if (_repo is not UserRepo concrete) return null;

        var u = await concrete.GetAuthRow(email);
        if (u is null) return null;

        if (!BCrypt.Net.BCrypt.Verify(senha, u.Value.SenhaHash))
            return null;

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, u.Value.Email),
            new Claim(ClaimTypes.Name, u.Value.Nome),
            new Claim(ClaimTypes.Role, u.Value.IsAdmin ? "Admin" : "User")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _cfg["Jwt:Issuer"],
            audience: _cfg["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(int.Parse(_cfg["Jwt:ExpiresMinutes"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task RegisterAsync(UserCreateDto dto)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
        await _repo.CreateAsync(dto, hash);
    }

    public async Task<User?> MeAsync(string email) => await _repo.GetByEmailAsync(email);

    public async Task<bool> CreateAdminIfNotExists(string email, string nome, string senha)
    {
        var exists = await _repo.GetByEmailAsync(email);
        if (exists is not null) return false;

        var dto = new UserCreateDto(email, nome, senha, true, null);
        await RegisterAsync(dto);
        return true;
    }

    // ============================================================
    // ============  ESQUECI MINHA SENHA (FORGOT/RESET) ===========
    // ============================================================

    /// <summary>
    /// Cria (ou recria) um token de reset de senha com 1h de validade.
    /// Não revela se o e-mail existe: sempre retorna true.
    /// Em DEV, loga o token no console para você copiar.
    /// </summary>
    public async Task<bool> CreatePasswordResetAsync(string email)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        // Se email não existe, retorna true assim mesmo (não revela usuários)
        await using (var exists = new SqlCommand("SELECT COUNT(1) FROM dbo.Users WHERE Email=@e", con))
        {
            exists.Parameters.AddWithValue("@e", email);
            var count = (int)await exists.ExecuteScalarAsync();
            if (count == 0) return true;
        }

        // Remove tokens antigos do mesmo e-mail (mantém apenas 1 ativo)
        await using (var delOld = new SqlCommand("DELETE FROM dbo.PasswordResets WHERE Email=@e", con))
        {
            delOld.Parameters.AddWithValue("@e", email);
            await delOld.ExecuteNonQueryAsync();
        }

        var token = Guid.NewGuid();

        // Insere novo token com 1h de expiração (UTC)
        await using (var ins = new SqlCommand(@"
            INSERT INTO dbo.PasswordResets (Token, Email, ExpiresAt)
            VALUES (@t, @e, DATEADD(hour, 1, SYSUTCDATETIME()))
        ", con))
        {
            ins.Parameters.AddWithValue("@t", token);
            ins.Parameters.AddWithValue("@e", email);
            await ins.ExecuteNonQueryAsync();
        }

        // Em DEV: imprime no console
        Console.WriteLine($"[DEV] Token de reset para {email}: {token}");

        return true;
    }

    /// <summary>
    /// Redefine a senha a partir do token (GUID).
    /// Invalida o token após o uso (one-time).
    /// </summary>
    public async Task<bool> ResetPasswordAsync(Guid token, string novaSenha)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        string? email = null;
        DateTime? expires = null;

        // Lê o token
        await using (var sel = new SqlCommand(
            "SELECT Email, ExpiresAt FROM dbo.PasswordResets WHERE Token=@t", con))
        {
            sel.Parameters.AddWithValue("@t", token);
            await using var rd = await sel.ExecuteReaderAsync();
            if (await rd.ReadAsync())
            {
                email = rd.GetString(0);
                expires = rd.GetDateTime(1);
            }
        }

        // Token inválido/expirado
        if (email is null || expires is null || DateTime.UtcNow > expires.Value)
        {
            // Limpeza: remove token inválido/expirado
            await using (var delBad = new SqlCommand("DELETE FROM dbo.PasswordResets WHERE Token=@t", con))
            {
                delBad.Parameters.AddWithValue("@t", token);
                await delBad.ExecuteNonQueryAsync();
            }
            return false;
        }

        // Gera novo hash (mesmo algoritmo do Register/Login)
        var novoHash = BCrypt.Net.BCrypt.HashPassword(novaSenha);

        // Atualiza a senha do usuário
        await using (var upd = new SqlCommand("UPDATE dbo.Users SET SenhaHash=@h WHERE Email=@e", con))
        {
            upd.Parameters.AddWithValue("@h", novoHash);
            upd.Parameters.AddWithValue("@e", email);
            await upd.ExecuteNonQueryAsync();
        }

        // Invalida o token (one-time use)
        await using (var del = new SqlCommand("DELETE FROM dbo.PasswordResets WHERE Token=@t", con))
        {
            del.Parameters.AddWithValue("@t", token);
            await del.ExecuteNonQueryAsync();
        }

        return true;
    }
}
