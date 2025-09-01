using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AlterKnowledgeCamposOpcionais : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<int>(
            name: "Origin",
            table: "Knowledge",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<Guid>(
            name: "IdAgent",
            table: "Knowledge",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<string>(
            name: "Description",
            table: "Knowledge",
            type: "varchar(400)",
            unicode: false,
            maxLength: 1000,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 1000);

        migrationBuilder.AddColumn<int>(
            name: "Module",
            table: "Knowledge",
            type: "integer",
            nullable: false,
            defaultValue: 0);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Module",
            table: "Knowledge");

        migrationBuilder.AlterColumn<int>(
            name: "Origin",
            table: "Knowledge",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "IdAgent",
            table: "Knowledge",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty,
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Description",
            table: "Knowledge",
            type: "varchar(400)",
            unicode: false,
            maxLength: 1000,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 1000,
            oldNullable: true);
    }
}
