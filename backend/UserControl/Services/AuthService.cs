using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserControl.Data;
using UserControl.DTOs;
using UserControl.Models;

namespace UserControl.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private static readonly Dictionary<string, string> _passwordResetTokens = new();

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);

            var claims = new List<Claim>
            {
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.Nome),
                new(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User"),
                new("IsAdmin", user.IsAdmin.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<User?> Authenticate(LoginDto loginDto)
        {
            var user = await _context.Users.FindAsync(loginDto.Email);
            if (user == null) return null;

            return BCrypt.Net.BCrypt.Verify(loginDto.Senha, user.SenhaHash) ? user : null;
        }

        public string GeneratePasswordResetToken()
        {
            return Guid.NewGuid().ToString();
        }

        public async Task<bool> ResetPassword(ResetPasswordDto resetDto)
        {
            if (_passwordResetTokens.TryGetValue(resetDto.Email, out var storedToken) && 
                storedToken == resetDto.Token)
            {
                var user = await _context.Users.FindAsync(resetDto.Email);
                if (user != null)
                {
                    user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(resetDto.NovaSenha);
                    _context.Users.Update(user);
                    await _context.SaveChangesAsync();
                    
                    _passwordResetTokens.Remove(resetDto.Email);
                    return true;
                }
            }
            return false;
        }
    }
}