using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class PrimeiraMigrationTenant : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Agents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Organization = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                Module = table.Column<int>(type: "integer", nullable: false),
                Type = table.Column<int>(type: "integer", nullable: false),
                Name = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 255, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Agents", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Logs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdUser = table.Column<Guid>(type: "char(36)", nullable: true),
                NameUser = table.Column<string>(type: "varchar(400)", unicode: false, nullable: true),
                UserEmail = table.Column<string>(type: "varchar(400)", unicode: false, nullable: true),
                ChangedEntity = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                TypeProcess = table.Column<int>(type: "integer", nullable: false),
                LastState = table.Column<string>(type: "TEXT", unicode: false, nullable: false),
                NewState = table.Column<string>(type: "TEXT", unicode: false, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_Logs", x => x.Id));

        migrationBuilder.CreateTable(
            name: "ChatSessions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                TotalInteractions = table.Column<int>(type: "integer", nullable: false),
                LastSendDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ChatSessions", x => x.Id);
                table.ForeignKey(
                    name: "FK_ChatSessions_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "ChatHistory",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdChatSession = table.Column<Guid>(type: "uuid", nullable: false),
                Content = table.Column<string>(type: "text", unicode: false, nullable: false),
                Role = table.Column<int>(type: "integer", nullable: false),
                TotalTokens = table.Column<int>(type: "integer", nullable: false),
                TotalTime = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ChatHistory", x => x.Id);
                table.ForeignKey(
                    name: "FK_ChatHistory_ChatSessions_IdChatSession",
                    column: x => x.IdChatSession,
                    principalTable: "ChatSessions",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_ChatHistory_IdChatSession",
            table: "ChatHistory",
            column: "IdChatSession");

        migrationBuilder.CreateIndex(
            name: "IX_ChatSessions_IdAgent",
            table: "ChatSessions",
            column: "IdAgent");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "ChatHistory");

        migrationBuilder.DropTable(
            name: "Logs");

        migrationBuilder.DropTable(
            name: "ChatSessions");

        migrationBuilder.DropTable(
            name: "Agents");
    }
}
