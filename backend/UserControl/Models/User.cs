using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserControl.Models
{
    [Table("Users")]
    public class User
    {
        // Chave primária (Email)
        [Key]
        [Required]
        [EmailAddress]
        [Column(TypeName = "varchar(50)")]
        public string Email { get; set; } = string.Empty;

        // Senha criptografada (BCrypt)
        [Required]
        [Column(TypeName = "varchar(255)")]
        public string SenhaHash { get; set; } = string.Empty;

        // Nome do usuário
        [Required]
        [Column(TypeName = "varchar(100)")]
        public string Nome { get; set; } = string.Empty;

        // Indica se é administrador (BIT no banco)
        [Required]
        public bool IsAdmin { get; set; } = false;

        // Email do gerente (coluna física = Users_Email)
        [Column("Users_Email", TypeName = "varchar(50)")]
        public string? ManagerEmail { get; set; }

        // Relação com o gerente
        [ForeignKey("ManagerEmail")]
        public User? Manager { get; set; }
    }
}
