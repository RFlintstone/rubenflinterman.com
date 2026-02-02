using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "file_storage",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    CompressedFileSize = table.Column<long>(type: "bigint", nullable: false),
                    LargeObjectOid = table.Column<uint>(type: "oid", nullable: false),
                    Sha256Hash = table.Column<string>(type: "char(64)", maxLength: 64, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DownloadCount = table.Column<int>(type: "integer", nullable: false),
                    LastAccessedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsCompressed = table.Column<bool>(type: "boolean", nullable: false)
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
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    Avatar = table.Column<string>(type: "text", nullable: false),
                    LastLogin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RefreshToken = table.Column<string>(type: "text", nullable: true),
                    RefreshTokenCreated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RefreshTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
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
                name: "DnD_Campaigns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Theme = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    DungeonMasterId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnD_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnD_Campaigns_Users_DungeonMasterId",
                        column: x => x.DungeonMasterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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

            migrationBuilder.CreateTable(
                name: "CampaignEnrollments",
                columns: table => new
                {
                    EnrolledCampaignsId = table.Column<Guid>(type: "uuid", nullable: false),
                    EnrolledUsersId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignEnrollments", x => new { x.EnrolledCampaignsId, x.EnrolledUsersId });
                    table.ForeignKey(
                        name: "FK_CampaignEnrollments_DnD_Campaigns_EnrolledCampaignsId",
                        column: x => x.EnrolledCampaignsId,
                        principalTable: "DnD_Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignEnrollments_Users_EnrolledUsersId",
                        column: x => x.EnrolledUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DnD_Characters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Class = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    DndBeyondUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignModelId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnD_Characters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnD_Characters_DnD_Campaigns_CampaignModelId",
                        column: x => x.CampaignModelId,
                        principalTable: "DnD_Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DnD_LoreEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignModelId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnD_LoreEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnD_LoreEntries_DnD_Campaigns_CampaignModelId",
                        column: x => x.CampaignModelId,
                        principalTable: "DnD_Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DnD_Quests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignModelId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnD_Quests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnD_Quests_DnD_Campaigns_CampaignModelId",
                        column: x => x.CampaignModelId,
                        principalTable: "DnD_Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "DnD_Quotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    Author = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    CampaignId = table.Column<Guid>(type: "uuid", nullable: false),
                    CampaignModelId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnD_Quotes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnD_Quotes_DnD_Campaigns_CampaignModelId",
                        column: x => x.CampaignModelId,
                        principalTable: "DnD_Campaigns",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CampaignEnrollments_EnrolledUsersId",
                table: "CampaignEnrollments",
                column: "EnrolledUsersId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Campaigns_DungeonMasterId",
                table: "DnD_Campaigns",
                column: "DungeonMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Characters_CampaignModelId",
                table: "DnD_Characters",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_LoreEntries_CampaignModelId",
                table: "DnD_LoreEntries",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quests_CampaignModelId",
                table: "DnD_Quests",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quotes_CampaignModelId",
                table: "DnD_Quotes",
                column: "CampaignModelId");

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
                name: "CampaignEnrollments");

            migrationBuilder.DropTable(
                name: "DnD_Characters");

            migrationBuilder.DropTable(
                name: "DnD_LoreEntries");

            migrationBuilder.DropTable(
                name: "DnD_Quests");

            migrationBuilder.DropTable(
                name: "DnD_Quotes");

            migrationBuilder.DropTable(
                name: "file_storage");

            migrationBuilder.DropTable(
                name: "RolePermissionsJoin");

            migrationBuilder.DropTable(
                name: "UserRolesJoin");

            migrationBuilder.DropTable(
                name: "DnD_Campaigns");

            migrationBuilder.DropTable(
                name: "UserPermissions");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
