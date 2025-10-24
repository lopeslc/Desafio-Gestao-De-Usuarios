using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserControl.DTOs;
using UserControl.Services;

namespace UserControl.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsers();
            return Ok(users);
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUser(string email)
        {
            var user = await _userService.GetUserByEmail(email);
            return user != null ? Ok(user) : NotFound();
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] RegisterDto registerDto)
        {
            if (await _userService.UserExists(registerDto.Email))
                return BadRequest("Usuário já existe");

            var user = await _userService.CreateUser(registerDto);
            return CreatedAtAction(nameof(GetUser), new { email = user.Email }, user);
        }

        [HttpPut("{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(string email, [FromBody] RegisterDto updateDto)
        {
            var result = await _userService.UpdateUser(email, updateDto);
            return result ? NoContent() : NotFound();
        }

        [HttpDelete("{email}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var result = await _userService.DeleteUser(email);
            return result ? NoContent() : NotFound();
        }
    }
}