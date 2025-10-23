namespace UserControl.DTOs
{
    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string NovaSenha { get; set; } = string.Empty;
    }
}