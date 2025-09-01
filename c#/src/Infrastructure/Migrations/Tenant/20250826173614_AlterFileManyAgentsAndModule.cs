using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AlterFileManyAgentsAndModule : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_File_Agents_IdAgent",
            table: "File");

        migrationBuilder.DropIndex(
            name: "IX_File_IdAgent",
            table: "File");

        migrationBuilder.DropColumn(
            name: "IdAgent",
            table: "File");

        migrationBuilder.AddColumn<int>(
            name: "Module",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.CreateTable(
            name: "AgentFile",
            columns: table => new
            {
                AgentsId = table.Column<Guid>(type: "uuid", nullable: false),
                FilesId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AgentFile", x => new { x.AgentsId, x.FilesId });
                table.ForeignKey(
                    name: "FK_AgentFile_Agents_AgentsId",
                    column: x => x.AgentsId,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_AgentFile_File_FilesId",
                    column: x => x.FilesId,
                    principalTable: "File",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_AgentFile_FilesId",
            table: "AgentFile",
            column: "FilesId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AgentFile");

        migrationBuilder.DropColumn(
            name: "Module",
            table: "File");

        migrationBuilder.AddColumn<Guid>(
            name: "IdAgent",
            table: "File",
            type: "uuid",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_File_IdAgent",
            table: "File",
            column: "IdAgent");

        migrationBuilder.AddForeignKey(
            name: "FK_File_Agents_IdAgent",
            table: "File",
            column: "IdAgent",
            principalTable: "Agents",
            principalColumn: "Id");
    }
}
