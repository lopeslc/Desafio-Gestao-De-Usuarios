using Microsoft.AspNetCore.Mvc;
using UserControl.DTOs;
using UserControl.Services;

namespace UserControl.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var user = await _authService.Authenticate(loginDto);
            if (user == null)
                return Unauthorized("Email ou senha inválidos");

            var token = await _authService.GenerateJwtToken(user);
            return Ok(new { token, user = new { user.Email, user.Nome, user.IsAdmin } });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (await _userService.UserExists(registerDto.Email))
                return BadRequest("Usuário já existe");

            var user = await _userService.CreateUser(registerDto);
            var token = await _authService.GenerateJwtToken(user);

            return Ok(new { token, user = new { user.Email, user.Nome, user.IsAdmin } });
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotDto)
        {
            if (!await _userService.UserExists(forgotDto.Email))
                return Ok(); // Por segurança, sempre retorna OK

            var token = _authService.GeneratePasswordResetToken();
            // Aqui você implementaria o envio de email
            // Por enquanto, vamos retornar o token (em produção, enviar por email)
            return Ok(new { token });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetDto)
        {
            var result = await _authService.ResetPassword(resetDto);
            return result ? Ok("Senha alterada com sucesso") : BadRequest("Token inválido ou expirado");
        }
    }
}