using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class RetiraKnowledgeHcmErp : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_SeniorErpConfig_Knowledge_IdKnowledge",
            table: "SeniorErpConfig");

        migrationBuilder.DropForeignKey(
            name: "FK_SeniorHcmConfig_Knowledge_IdKnowledge",
            table: "SeniorHcmConfig");

        migrationBuilder.DropIndex(
            name: "IX_SeniorHcmConfig_IdKnowledge",
            table: "SeniorHcmConfig");

        migrationBuilder.DropIndex(
            name: "IX_SeniorErpConfig_IdKnowledge",
            table: "SeniorErpConfig");

        migrationBuilder.DropColumn(
            name: "IdKnowledge",
            table: "SeniorHcmConfig");

        migrationBuilder.DropColumn(
            name: "IdKnowledge",
            table: "SeniorErpConfig");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<Guid>(
            name: "IdKnowledge",
            table: "SeniorHcmConfig",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty);

        migrationBuilder.AddColumn<Guid>(
            name: "IdKnowledge",
            table: "SeniorErpConfig",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty);

        migrationBuilder.CreateIndex(
            name: "IX_SeniorHcmConfig_IdKnowledge",
            table: "SeniorHcmConfig",
            column: "IdKnowledge");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorErpConfig_IdKnowledge",
            table: "SeniorErpConfig",
            column: "IdKnowledge");

        migrationBuilder.AddForeignKey(
            name: "FK_SeniorErpConfig_Knowledge_IdKnowledge",
            table: "SeniorErpConfig",
            column: "IdKnowledge",
            principalTable: "Knowledge",
            principalColumn: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_SeniorHcmConfig_Knowledge_IdKnowledge",
            table: "SeniorHcmConfig",
            column: "IdKnowledge",
            principalTable: "Knowledge",
            principalColumn: "Id");
    }
}
