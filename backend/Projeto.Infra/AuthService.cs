using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Projeto.Core;

namespace Projeto.Infra;

public class AuthService : IAuthService
{
    private readonly IUserRepo _repo;
    private readonly IConfiguration _cfg;

    public AuthService(IUserRepo repo, IConfiguration cfg)
    {
        _repo = repo;
        _cfg = cfg;
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
            signingCredentials: creds);

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
}
