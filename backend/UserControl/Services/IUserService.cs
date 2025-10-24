using UserControl.DTOs;
using UserControl.Models;

namespace UserControl.Services
{
    public interface IUserService
    {
        Task<UserResponseDto?> GetUserByEmail(string email);
        Task<List<UserResponseDto>> GetAllUsers();
        Task<User> CreateUser(RegisterDto registerDto);
        Task<bool> UpdateUser(string email, RegisterDto updateDto);
        Task<bool> DeleteUser(string email);
        Task<bool> UserExists(string email);
    }
}