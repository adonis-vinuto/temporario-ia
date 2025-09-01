using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Master;

/// <inheritdoc />
public partial class AdicionaSqlPort : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "SqlPort",
            table: "DataConfigs",
            type: "varchar(400)",
            unicode: false,
            maxLength: 150,
            nullable: false,
            defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "SqlPort",
            table: "DataConfigs");
    }
}
