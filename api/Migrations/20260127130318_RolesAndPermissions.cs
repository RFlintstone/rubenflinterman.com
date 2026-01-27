using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class RolesAndPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Roles",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "file_storage",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    LargeObjectOid = table.Column<uint>(type: "oid", nullable: false),
                    Sha256Hash = table.Column<string>(type: "char(64)", maxLength: 64, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false),
                    LastAccessedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_file_storage", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    OnUrl = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleName = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissionsJoin",
                columns: table => new
                {
                    RolePermissionsId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserRoleModelId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissionsJoin", x => new { x.RolePermissionsId, x.UserRoleModelId });
                    table.ForeignKey(
                        name: "FK_RolePermissionsJoin_UserPermissions_RolePermissionsId",
                        column: x => x.RolePermissionsId,
                        principalTable: "UserPermissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RolePermissionsJoin_UserRoles_UserRoleModelId",
                        column: x => x.UserRoleModelId,
                        principalTable: "UserRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserRolesJoin",
                columns: table => new
                {
                    RolesId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserInfoModelId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRolesJoin", x => new { x.RolesId, x.UserInfoModelId });
                    table.ForeignKey(
                        name: "FK_UserRolesJoin_UserRoles_RolesId",
                        column: x => x.RolesId,
                        principalTable: "UserRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserRolesJoin_Users_UserInfoModelId",
                        column: x => x.UserInfoModelId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_file_storage_ExpiresAtUtc_IsDeleted",
                table: "file_storage",
                columns: new[] { "ExpiresAtUtc", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_file_storage_OwnerId",
                table: "file_storage",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_file_storage_Sha256Hash",
                table: "file_storage",
                column: "Sha256Hash");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionsJoin_UserRoleModelId",
                table: "RolePermissionsJoin",
                column: "UserRoleModelId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissions_PermissionName",
                table: "UserPermissions",
                column: "PermissionName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleName",
                table: "UserRoles",
                column: "RoleName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRolesJoin_UserInfoModelId",
                table: "UserRolesJoin",
                column: "UserInfoModelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "file_storage");

            migrationBuilder.DropTable(
                name: "RolePermissionsJoin");

            migrationBuilder.DropTable(
                name: "UserRolesJoin");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.AddColumn<string[]>(
                name: "Roles",
                table: "Users",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);
        }
    }
}
