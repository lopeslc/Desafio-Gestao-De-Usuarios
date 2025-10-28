using Microsoft.EntityFrameworkCore;
using UserControl.Models;

namespace UserControl.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }

       protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<User>(entity =>
    {
        entity.ToTable("Users");
        entity.HasKey(u => u.Email);

        entity.Property(u => u.Email).HasColumnType("VARCHAR(50)").IsRequired();
        entity.Property(u => u.SenhaHash).HasColumnType("VARCHAR(255)").IsRequired();
        entity.Property(u => u.Nome).HasColumnType("VARCHAR(100)").IsRequired();
        entity.Property(u => u.IsAdmin).HasColumnType("BIT").HasDefaultValue(false);
        entity.Property(u => u.ManagerEmail).HasColumnType("VARCHAR(50)");

        entity.Property(u => u.ResetToken).HasColumnType("VARCHAR(100)");
        entity.Property(u => u.ResetTokenExpiry).HasColumnType("DATETIME");
        entity.Property(u => u.CreatedAt).HasColumnType("DATETIME").HasDefaultValueSql("GETDATE()");
        entity.Property(u => u.UpdatedAt).HasColumnType("DATETIME");

        entity.HasOne(u => u.Manager)
              .WithMany()
              .HasForeignKey(u => u.ManagerEmail)
              .OnDelete(DeleteBehavior.NoAction);
    });
}
    }
}
