namespace UserControl.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public string? ManagerEmail { get; set; }
    }
}