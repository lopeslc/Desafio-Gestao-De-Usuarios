namespace Projeto.Core;

public interface IUserRepo
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task CreateAsync(UserCreateDto dto, string senhaHash);
    Task UpdateAsync(string email, UserUpdateDto dto);
    Task DeleteAsync(string email);
}

public interface IAuthService
{
    Task<string?> LoginAsync(string email, string senha);
    Task RegisterAsync(UserCreateDto dto);
    Task<User?> MeAsync(string email);
    Task<bool> CreateAdminIfNotExists(string email, string nome, string senha);
}
