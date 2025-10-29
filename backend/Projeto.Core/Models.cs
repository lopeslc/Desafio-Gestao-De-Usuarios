namespace Projeto.Core;

public record User(string Email, string Nome, bool IsAdmin, string? ManagerEmail);
public record UserCreateDto(string Email, string Nome, string Senha, bool IsAdmin, string? ManagerEmail);
public record UserUpdateDto(string Nome, bool IsAdmin, string? ManagerEmail);
public record LoginDto(string Email, string Senha);
