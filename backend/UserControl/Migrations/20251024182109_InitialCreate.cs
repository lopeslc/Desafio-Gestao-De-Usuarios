using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserControl.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Email = table.Column<string>(type: "VARCHAR(50)", nullable: false),
                    SenhaHash = table.Column<string>(type: "VARCHAR(255)", nullable: false),
                    Nome = table.Column<string>(type: "VARCHAR(100)", nullable: false),
                    IsAdmin = table.Column<bool>(type: "BIT", nullable: false, defaultValue: false),
                    Users_Email = table.Column<string>(type: "VARCHAR(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Email);
                    table.ForeignKey(
                        name: "FK_Users_Users_Users_Email",
                        column: x => x.Users_Email,
                        principalTable: "Users",
                        principalColumn: "Email");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_Users_Email",
                table: "Users",
                column: "Users_Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
