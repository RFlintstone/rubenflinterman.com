using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Api.Migrations
{
    /// <inheritdoc />
    public partial class DnDForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Characters_DnD_Campaigns_CampaignModelId",
                table: "DnD_Characters");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_LoreEntries_DnD_Campaigns_CampaignModelId",
                table: "DnD_LoreEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Quests_DnD_Campaigns_CampaignModelId",
                table: "DnD_Quests");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Quotes_DnD_Campaigns_CampaignModelId",
                table: "DnD_Quotes");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Quotes_CampaignModelId",
                table: "DnD_Quotes");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Quests_CampaignModelId",
                table: "DnD_Quests");

            migrationBuilder.DropIndex(
                name: "IX_DnD_LoreEntries_CampaignModelId",
                table: "DnD_LoreEntries");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Characters_CampaignModelId",
                table: "DnD_Characters");

            migrationBuilder.DropColumn(
                name: "CampaignModelId",
                table: "DnD_Quotes");

            migrationBuilder.DropColumn(
                name: "CampaignModelId",
                table: "DnD_Quests");

            migrationBuilder.DropColumn(
                name: "CampaignModelId",
                table: "DnD_LoreEntries");

            migrationBuilder.DropColumn(
                name: "CampaignModelId",
                table: "DnD_Characters");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quotes_CampaignId",
                table: "DnD_Quotes",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quests_CampaignId",
                table: "DnD_Quests",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_LoreEntries_CampaignId",
                table: "DnD_LoreEntries",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Characters_CampaignId",
                table: "DnD_Characters",
                column: "CampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Characters_DnD_Campaigns_CampaignId",
                table: "DnD_Characters",
                column: "CampaignId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_LoreEntries_DnD_Campaigns_CampaignId",
                table: "DnD_LoreEntries",
                column: "CampaignId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Quests_DnD_Campaigns_CampaignId",
                table: "DnD_Quests",
                column: "CampaignId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Quotes_DnD_Campaigns_CampaignId",
                table: "DnD_Quotes",
                column: "CampaignId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Characters_DnD_Campaigns_CampaignId",
                table: "DnD_Characters");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_LoreEntries_DnD_Campaigns_CampaignId",
                table: "DnD_LoreEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Quests_DnD_Campaigns_CampaignId",
                table: "DnD_Quests");

            migrationBuilder.DropForeignKey(
                name: "FK_DnD_Quotes_DnD_Campaigns_CampaignId",
                table: "DnD_Quotes");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Quotes_CampaignId",
                table: "DnD_Quotes");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Quests_CampaignId",
                table: "DnD_Quests");

            migrationBuilder.DropIndex(
                name: "IX_DnD_LoreEntries_CampaignId",
                table: "DnD_LoreEntries");

            migrationBuilder.DropIndex(
                name: "IX_DnD_Characters_CampaignId",
                table: "DnD_Characters");

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignModelId",
                table: "DnD_Quotes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignModelId",
                table: "DnD_Quests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignModelId",
                table: "DnD_LoreEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CampaignModelId",
                table: "DnD_Characters",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quotes_CampaignModelId",
                table: "DnD_Quotes",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Quests_CampaignModelId",
                table: "DnD_Quests",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_LoreEntries_CampaignModelId",
                table: "DnD_LoreEntries",
                column: "CampaignModelId");

            migrationBuilder.CreateIndex(
                name: "IX_DnD_Characters_CampaignModelId",
                table: "DnD_Characters",
                column: "CampaignModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Characters_DnD_Campaigns_CampaignModelId",
                table: "DnD_Characters",
                column: "CampaignModelId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_LoreEntries_DnD_Campaigns_CampaignModelId",
                table: "DnD_LoreEntries",
                column: "CampaignModelId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Quests_DnD_Campaigns_CampaignModelId",
                table: "DnD_Quests",
                column: "CampaignModelId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DnD_Quotes_DnD_Campaigns_CampaignModelId",
                table: "DnD_Quotes",
                column: "CampaignModelId",
                principalTable: "DnD_Campaigns",
                principalColumn: "Id");
        }
    }
}
