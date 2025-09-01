using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AgentesHcmErp : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_SeniorErpConfig_Agents_IdAgent",
            table: "SeniorErpConfig");

        migrationBuilder.DropForeignKey(
            name: "FK_SeniorHcmConfig_Agents_IdAgent",
            table: "SeniorHcmConfig");

        migrationBuilder.DropIndex(
            name: "IX_SeniorHcmConfig_IdAgent",
            table: "SeniorHcmConfig");

        migrationBuilder.DropIndex(
            name: "IX_SeniorErpConfig_IdAgent",
            table: "SeniorErpConfig");

        migrationBuilder.DropColumn(
            name: "IdAgent",
            table: "SeniorHcmConfig");

        migrationBuilder.DropColumn(
            name: "IdAgent",
            table: "SeniorErpConfig");

        migrationBuilder.CreateTable(
            name: "AgentSeniorErpConfig",
            columns: table => new
            {
                AgentsId = table.Column<Guid>(type: "uuid", nullable: false),
                SeniorErpConfigsId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AgentSeniorErpConfig", x => new { x.AgentsId, x.SeniorErpConfigsId });
                table.ForeignKey(
                    name: "FK_AgentSeniorErpConfig_Agents_AgentsId",
                    column: x => x.AgentsId,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_AgentSeniorErpConfig_SeniorErpConfig_SeniorErpConfigsId",
                    column: x => x.SeniorErpConfigsId,
                    principalTable: "SeniorErpConfig",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "AgentSeniorHcmConfig",
            columns: table => new
            {
                AgentsId = table.Column<Guid>(type: "uuid", nullable: false),
                SeniorHcmConfigsId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AgentSeniorHcmConfig", x => new { x.AgentsId, x.SeniorHcmConfigsId });
                table.ForeignKey(
                    name: "FK_AgentSeniorHcmConfig_Agents_AgentsId",
                    column: x => x.AgentsId,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_AgentSeniorHcmConfig_SeniorHcmConfig_SeniorHcmConfigsId",
                    column: x => x.SeniorHcmConfigsId,
                    principalTable: "SeniorHcmConfig",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_AgentSeniorErpConfig_SeniorErpConfigsId",
            table: "AgentSeniorErpConfig",
            column: "SeniorErpConfigsId");

        migrationBuilder.CreateIndex(
            name: "IX_AgentSeniorHcmConfig_SeniorHcmConfigsId",
            table: "AgentSeniorHcmConfig",
            column: "SeniorHcmConfigsId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AgentSeniorErpConfig");

        migrationBuilder.DropTable(
            name: "AgentSeniorHcmConfig");

        migrationBuilder.AddColumn<Guid>(
            name: "IdAgent",
            table: "SeniorHcmConfig",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty);

        migrationBuilder.AddColumn<Guid>(
            name: "IdAgent",
            table: "SeniorErpConfig",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty);

        migrationBuilder.CreateIndex(
            name: "IX_SeniorHcmConfig_IdAgent",
            table: "SeniorHcmConfig",
            column: "IdAgent");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorErpConfig_IdAgent",
            table: "SeniorErpConfig",
            column: "IdAgent");

        migrationBuilder.AddForeignKey(
            name: "FK_SeniorErpConfig_Agents_IdAgent",
            table: "SeniorErpConfig",
            column: "IdAgent",
            principalTable: "Agents",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_SeniorHcmConfig_Agents_IdAgent",
            table: "SeniorHcmConfig",
            column: "IdAgent",
            principalTable: "Agents",
            principalColumn: "Id");
    }
}
