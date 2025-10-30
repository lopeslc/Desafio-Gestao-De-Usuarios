namespace Projeto.Core;

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string senha);
    Task RegisterAsync(UserCreateDto dto);
    Task<User?> MeAsync(string email);
    Task<bool> CreateAdminIfNotExists(string email, string nome, string senha);

    // já existentes para forgot/reset (se você manteve)
    Task<bool> CreatePasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(Guid token, string novaSenha);

    // NOVO: trocar senha do usuário logado
    Task<bool> ChangePasswordAsync(string email, string currentSenha, string novaSenha);
}

public interface IUserRepo
{
    Task CreateAsync(UserCreateDto dto, string senhaHash);
    Task<User?> GetByEmailAsync(string email);
    Task<(string Email, string SenhaHash, bool IsAdmin, string Nome)?> GetAuthRow(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task UpdateAsync(string email, UserUpdateDto dto);
    Task DeleteAsync(string email);

    // NOVO: atualizar hash de senha
    Task UpdatePasswordHashAsync(string email, string newHash);
}
