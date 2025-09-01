using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AlterKnowledgeManyAgents : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Knowledge_Agents_IdAgent",
            table: "Knowledge");

        migrationBuilder.DropIndex(
            name: "IX_Knowledge_IdAgent",
            table: "Knowledge");

        migrationBuilder.DropColumn(
            name: "IdAgent",
            table: "Knowledge");

        migrationBuilder.CreateTable(
            name: "AgentKnowledge",
            columns: table => new
            {
                AgentsId = table.Column<Guid>(type: "uuid", nullable: false),
                KnowledgesId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AgentKnowledge", x => new { x.AgentsId, x.KnowledgesId });
                table.ForeignKey(
                    name: "FK_AgentKnowledge_Agents_AgentsId",
                    column: x => x.AgentsId,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_AgentKnowledge_Knowledge_KnowledgesId",
                    column: x => x.KnowledgesId,
                    principalTable: "Knowledge",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_AgentKnowledge_KnowledgesId",
            table: "AgentKnowledge",
            column: "KnowledgesId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AgentKnowledge");

        migrationBuilder.AddColumn<Guid>(
            name: "IdAgent",
            table: "Knowledge",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Knowledge_IdAgent",
            table: "Knowledge",
            column: "IdAgent");

        migrationBuilder.AddForeignKey(
            name: "FK_Knowledge_Agents_IdAgent",
            table: "Knowledge",
            column: "IdAgent",
            principalTable: "Agents",
            principalColumn: "Id");
    }
}
