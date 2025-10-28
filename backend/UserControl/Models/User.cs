using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserControl.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [Required]
        [EmailAddress]
        [Column(TypeName = "varchar(50)")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(255)")]
        public string SenhaHash { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "varchar(100)")]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public bool IsAdmin { get; set; } = false;

        [Column(TypeName = "varchar(50)")]
        public string? ManagerEmail { get; set; }

        [ForeignKey("ManagerEmail")]
        public User? Manager { get; set; }

        // Para "Esqueci minha senha"
        public string? ResetToken { get; set; }
        public DateTime? ResetTokenExpiry { get; set; }

        // Auditoria
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}