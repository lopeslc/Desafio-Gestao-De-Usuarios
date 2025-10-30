namespace Projeto.Core;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string senha);
    Task RegisterAsync(UserCreateDto dto);
    Task<User?> MeAsync(string email);
    Task<bool> CreateAdminIfNotExists(string email, string nome, string senha);

    // Esqueci a senha
    Task<bool> CreatePasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(Guid token, string novaSenha);
}

public interface IUserRepo
{
    Task CreateAsync(UserCreateDto dto, string senhaHash);
    Task<User?> GetByEmailAsync(string email);
    Task<(string Email, string SenhaHash, bool IsAdmin, string Nome)?> GetAuthRow(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task UpdateAsync(string email, UserUpdateDto dto);
    Task DeleteAsync(string email);
}
