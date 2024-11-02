using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class first : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    TokenCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Email", "LastLogin", "Password", "PhoneNumber", "Token", "TokenCreated", "TokenExpiry", "Username" },
                values: new object[,]
                {
                    { new Guid("99a90e06-fc35-4d1a-bcbf-ff208738447b"), "user@user.com", new DateTime(2024, 11, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1591), "vh8z0h/sJbBQxloSzZRTrw==", "", "user_token", new DateTime(2024, 11, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1592), new DateTime(2024, 12, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1592), "User" },
                    { new Guid("ac7639cd-f488-442f-ae6f-5f00e1004f9e"), "r.w.flinterman@hotmail.com", new DateTime(2024, 11, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1300), "Vj9BECZRhJgcuh9+LU3vYQ==", "", "deqdCsDhKsfYxBLgHLsdHJWhsdpvEUULb6Ry99HEHproXQMdbqP3kXepYRwyGG2Ie64x38CAbsuzjdxUdGAkD3klDbQrMeB5a7J0", new DateTime(2024, 11, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1301), new DateTime(2024, 12, 2, 22, 18, 22, 83, DateTimeKind.Utc).AddTicks(1302), "Ruben" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
