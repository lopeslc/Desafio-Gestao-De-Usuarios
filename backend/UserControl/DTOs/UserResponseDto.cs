namespace UserControl.DTOs
{
    public class UserResponseDto
    {
        public string Email { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public bool IsAdmin { get; set; }
        public string? ManagerEmail { get; set; }
        public string? ManagerNome { get; set; }
    }
}