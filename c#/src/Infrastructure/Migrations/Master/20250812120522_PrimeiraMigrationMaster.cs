using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Master;

/// <inheritdoc />
public partial class PrimeiraMigrationMaster : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "DataConfigs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Module = table.Column<int>(type: "integer", nullable: false),
                Organization = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 150, nullable: false),
                SqlHost = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 150, nullable: false),
                SqlUser = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                SqlPassword = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                SqlDatabase = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                BlobConnectionString = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 500, nullable: false),
                BlobContainerName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_DataConfigs", x => x.Id));

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
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "DataConfigs");

        migrationBuilder.DropTable(
            name: "Logs");
    }
}
