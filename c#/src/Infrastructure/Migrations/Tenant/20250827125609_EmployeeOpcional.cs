using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class EmployeeOpcional : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTime>(
            name: "TerminationDate",
            table: "Employee",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AlterColumn<string>(
            name: "StreetAddress",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 200,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 200);

        migrationBuilder.AlterColumn<string>(
            name: "StatusDescription",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "StatusCodSenior",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<DateTime>(
            name: "SalaryEffectiveDate",
            table: "Employee",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AlterColumn<decimal>(
            name: "Salary",
            table: "Employee",
            type: "numeric(15,2)",
            nullable: true,
            oldClrType: typeof(decimal),
            oldType: "numeric(15,2)");

        migrationBuilder.AlterColumn<string>(
            name: "Race",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "PostalCode",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "FullName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100);

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CostCneterName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CostCenterCodSeniorCodCcu",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<decimal>(
            name: "ComplementarySalary",
            table: "Employee",
            type: "numeric(15,2)",
            nullable: true,
            oldClrType: typeof(decimal),
            oldType: "numeric(15,2)");

        migrationBuilder.AlterColumn<string>(
            name: "CompanyName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CollaboratorTypeCodeSeniorTipeCol",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CityName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100);

        migrationBuilder.AlterColumn<DateTime>(
            name: "BirthDate",
            table: "Employee",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AlterColumn<DateTime>(
            name: "AdmissionDate",
            table: "Employee",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AlterColumn<string>(
            name: "AddressNumber",
            table: "Employee",
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
        migrationBuilder.AlterColumn<DateTime>(
            name: "TerminationDate",
            table: "Employee",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "StreetAddress",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 200,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 200,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "StatusDescription",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "StatusCodSenior",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "SalaryEffectiveDate",
            table: "Employee",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<decimal>(
            name: "Salary",
            table: "Employee",
            type: "numeric(15,2)",
            nullable: false,
            defaultValue: 0m,
            oldClrType: typeof(decimal),
            oldType: "numeric(15,2)",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "Race",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "PostalCode",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "FullName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CostCneterName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CostCenterCodSeniorCodCcu",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<decimal>(
            name: "ComplementarySalary",
            table: "Employee",
            type: "numeric(15,2)",
            nullable: false,
            defaultValue: 0m,
            oldClrType: typeof(decimal),
            oldType: "numeric(15,2)",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CollaboratorTypeCodeSeniorTipeCol",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CityName",
            table: "Employee",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100,
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "BirthDate",
            table: "Employee",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "AdmissionDate",
            table: "Employee",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "AddressNumber",
            table: "Employee",
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
