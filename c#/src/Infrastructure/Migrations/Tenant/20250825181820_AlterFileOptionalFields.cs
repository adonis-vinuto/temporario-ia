using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AlterFileOptionalFields : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "FileId",
            table: "Page",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<int>(
            name: "TotalTokens",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "TotalTime",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<string>(
            name: "TotalPages",
            table: "File",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "Summary",
            table: "File",
            type: "varchar(400)",
            unicode: false,
            maxLength: 1000,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 1000);

        migrationBuilder.AlterColumn<int>(
            name: "QueueTime",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "PromptTokens",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "PromptTime",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<Guid>(
            name: "IdAgent",
            table: "File",
            type: "uuid",
            nullable: true,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<int>(
            name: "CompletionTokens",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<int>(
            name: "CompletionTime",
            table: "File",
            type: "integer",
            nullable: true,
            oldClrType: typeof(int),
            oldType: "integer");

        migrationBuilder.AlterColumn<string>(
            name: "Answer",
            table: "File",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<Guid>(
            name: "FileId",
            table: "Page",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty,
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "TotalTokens",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "TotalTime",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "TotalPages",
            table: "File",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Summary",
            table: "File",
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

        migrationBuilder.AlterColumn<int>(
            name: "QueueTime",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "PromptTokens",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "PromptTime",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "IdAgent",
            table: "File",
            type: "uuid",
            nullable: false,
            defaultValue: Guid.Empty,
            oldClrType: typeof(Guid),
            oldType: "uuid",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "CompletionTokens",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<int>(
            name: "CompletionTime",
            table: "File",
            type: "integer",
            nullable: false,
            defaultValue: 0,
            oldClrType: typeof(int),
            oldType: "integer",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Answer",
            table: "File",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);
    }
}
