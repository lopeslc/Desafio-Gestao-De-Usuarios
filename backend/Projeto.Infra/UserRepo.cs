using System.Data;
using Microsoft.Data.SqlClient;
using Projeto.Core;

namespace Projeto.Infra;

public class UserRepo : IUserRepo
{
    private readonly string _connStr;
    public UserRepo(string connStr) => _connStr = connStr;

    public async Task CreateAsync(UserCreateDto dto, string senhaHash)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            INSERT INTO dbo.Users (Email, Nome, SenhaHash, IsAdmin, ManagerEmail)
            VALUES (@e, @n, @h, @a, @m)
        ", con);

        cmd.Parameters.AddWithValue("@e", dto.Email);
        cmd.Parameters.AddWithValue("@n", dto.Nome);
        cmd.Parameters.AddWithValue("@h", senhaHash);
        cmd.Parameters.AddWithValue("@a", dto.IsAdmin);
        cmd.Parameters.AddWithValue("@m", (object?)dto.ManagerEmail ?? DBNull.Value);

        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdatePasswordHashAsync(string email, string newHash)
    {
        using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            UPDATE dbo.Users
            SET SenhaHash = @hash
            WHERE Email = @e", con);

        cmd.Parameters.AddWithValue("@hash", newHash);
        cmd.Parameters.AddWithValue("@e", email);

        await cmd.ExecuteNonQueryAsync();
    }


    public async Task<User?> GetByEmailAsync(string email)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT Email, Nome, IsAdmin, ManagerEmail
            FROM dbo.Users
            WHERE Email=@e
        ", con);
        cmd.Parameters.AddWithValue("@e", email);

        await using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return new User(
            rd.GetString(0),
            rd.GetString(1),
            rd.GetBoolean(2),
            rd.IsDBNull(3) ? null : rd.GetString(3)
        );
    }

    // 👇 ESTE PRECISA SER PUBLIC
    public async Task<(string Email, string SenhaHash, bool IsAdmin, string Nome)?> GetAuthRow(string email)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT Email, SenhaHash, IsAdmin, Nome
            FROM dbo.Users
            WHERE Email=@e
        ", con);
        cmd.Parameters.AddWithValue("@e", email);

        await using var rd = await cmd.ExecuteReaderAsync();
        if (!await rd.ReadAsync()) return null;

        return (
            rd.GetString(0),
            rd.GetString(1),
            rd.GetBoolean(2),
            rd.GetString(3)
        );
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        var list = new List<User>();
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            SELECT Email, Nome, IsAdmin, ManagerEmail
            FROM dbo.Users
            ORDER BY Nome
        ", con);

        await using var rd = await cmd.ExecuteReaderAsync();
        while (await rd.ReadAsync())
        {
            list.Add(new User(
                rd.GetString(0),
                rd.GetString(1),
                rd.GetBoolean(2),
                rd.IsDBNull(3) ? null : rd.GetString(3)
            ));
        }
        return list;
    }

    public async Task UpdateAsync(string email, UserUpdateDto dto)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand(@"
            UPDATE dbo.Users
            SET Nome=@n, IsAdmin=@a, ManagerEmail=@m
            WHERE Email=@e
        ", con);

        cmd.Parameters.AddWithValue("@n", dto.Nome);
        cmd.Parameters.AddWithValue("@a", dto.IsAdmin);
        cmd.Parameters.AddWithValue("@m", (object?)dto.ManagerEmail ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@e", email);

        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(string email)
    {
        await using var con = new SqlConnection(_connStr);
        await con.OpenAsync();

        var cmd = new SqlCommand("DELETE FROM dbo.Users WHERE Email=@e", con);
        cmd.Parameters.AddWithValue("@e", email);

        await cmd.ExecuteNonQueryAsync();
    }
}
