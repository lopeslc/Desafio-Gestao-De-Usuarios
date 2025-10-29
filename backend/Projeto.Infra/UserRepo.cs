using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Projeto.Core;

namespace Projeto.Infra;

public class UserRepo : IUserRepo
{
    private readonly string _conn;
    public UserRepo(string connectionString) => _conn = connectionString;
    private IDbConnection Conn() => new SqlConnection(_conn);

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = "SELECT Email, Nome, IsAdmin, ManagerEmail FROM Users WHERE Email=@Email";
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        const string sql = "SELECT Email, Nome, IsAdmin, ManagerEmail FROM Users ORDER BY Nome";
        using var c = Conn();
        return await c.QueryAsync<User>(sql);
    }

    public async Task CreateAsync(UserCreateDto dto, string senhaHash)
    {
        const string sql = @"INSERT INTO Users (Email, SenhaHash, Nome, IsAdmin, ManagerEmail)
                             VALUES (@Email, @SenhaHash, @Nome, @IsAdmin, @ManagerEmail)";
        using var c = Conn();
        await c.ExecuteAsync(sql, new { dto.Email, SenhaHash = senhaHash, dto.Nome, dto.IsAdmin, dto.ManagerEmail });
    }

    public async Task UpdateAsync(string email, UserUpdateDto dto)
    {
        const string sql = @"UPDATE Users SET Nome=@Nome, IsAdmin=@IsAdmin, ManagerEmail=@ManagerEmail
                             WHERE Email=@Email";
        using var c = Conn();
        await c.ExecuteAsync(sql, new { Email = email, dto.Nome, dto.IsAdmin, dto.ManagerEmail });
    }

    public async Task DeleteAsync(string email)
    {
        using var c = Conn();
        await c.ExecuteAsync("DELETE FROM Users WHERE Email=@Email", new { Email = email });
    }

    // usado pelo AuthService para verificar hash de senha
    internal async Task<(string Email, string SenhaHash, string Nome, bool IsAdmin, string? ManagerEmail)?> GetAuthRow(string email)
    {
        const string sql = @"SELECT Email, SenhaHash, Nome, IsAdmin, ManagerEmail
                             FROM Users WHERE Email=@Email";
        using var c = Conn();
        return await c.QueryFirstOrDefaultAsync<(string, string, string, bool, string?)>(sql, new { Email = email });
    }
}
