using Microsoft.EntityFrameworkCore;
using UserControl.Data;
using UserControl.DTOs;
using UserControl.Models;

namespace UserControl.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponseDto?> GetUserByEmail(string email)
        {
            var user = await _context.Users
                .Include(u => u.Manager)
                .FirstOrDefaultAsync(u => u.Email == email);

            return user == null ? null : new UserResponseDto
            {
                Email = user.Email,
                Nome = user.Nome,
                IsAdmin = user.IsAdmin,
                ManagerEmail = user.ManagerEmail,
                ManagerNome = user.Manager?.Nome
            };
        }

        public async Task<List<UserResponseDto>> GetAllUsers()
        {
            return await _context.Users
                .Include(u => u.Manager)
                .Select(u => new UserResponseDto
                {
                    Email = u.Email,
                    Nome = u.Nome,
                    IsAdmin = u.IsAdmin,
                    ManagerEmail = u.ManagerEmail,
                    ManagerNome = u.Manager!.Nome
                })
                .ToListAsync();
        }

        public async Task<User> CreateUser(RegisterDto registerDto)
        {
            var user = new User
            {
                Email = registerDto.Email,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Senha),
                Nome = registerDto.Nome,
                IsAdmin = registerDto.IsAdmin,
                ManagerEmail = registerDto.ManagerEmail
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<bool> UpdateUser(string email, RegisterDto updateDto)
        {
            var user = await _context.Users.FindAsync(email);
            if (user == null) return false;

            user.Nome = updateDto.Nome;
            user.IsAdmin = updateDto.IsAdmin;
            user.ManagerEmail = updateDto.ManagerEmail;

            if (!string.IsNullOrEmpty(updateDto.Senha))
            {
                user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(updateDto.Senha);
            }

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteUser(string email)
        {
            var user = await _context.Users.FindAsync(email);
            if (user == null) return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UserExists(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
    }
}