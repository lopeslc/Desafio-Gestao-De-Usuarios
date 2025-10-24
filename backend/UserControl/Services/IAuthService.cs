using UserControl.DTOs;
using UserControl.Models;

namespace UserControl.Services
{
    public interface IAuthService
    {
        Task<string> GenerateJwtToken(User user);
        Task<User?> Authenticate(LoginDto loginDto);
        string GeneratePasswordResetToken();
        Task<bool> ResetPassword(ResetPasswordDto resetDto);
    }
}