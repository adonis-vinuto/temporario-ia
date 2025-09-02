using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AlterEmployeeSalaryPayroll : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Payroll_Employee_IdEmployee",
            table: "Payroll");

        migrationBuilder.DropForeignKey(
            name: "FK_SalaryHistory_Employee_IdEmployee",
            table: "SalaryHistory");

        migrationBuilder.AlterColumn<string>(
              name: "Id",
              table: "Employee",
              type: "varchar(400)",
              unicode: false,
              nullable: false,
              oldClrType: typeof(Guid),
              oldType: "uuid");

        migrationBuilder.AlterColumn<string>(
            name: "MotiveCodSeniorCodMot",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "IdEmployee",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<DateTime>(
            name: "ChangeDate",
            table: "SalaryHistory",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AddColumn<string>(
            name: "CompanyCodSeniorCodFil",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "MotiveName",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AlterColumn<DateTime>(
            name: "ReferenceDate",
            table: "Payroll",
            type: "date",
            nullable: true,
            oldClrType: typeof(DateTime),
            oldType: "date");

        migrationBuilder.AlterColumn<string>(
            name: "PayrollPeriodCodSeniorCodCal",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "PayrollPeriodCod",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "IdEmployee",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            oldClrType: typeof(Guid),
            oldType: "uuid");

        migrationBuilder.AlterColumn<string>(
            name: "EventTypeName",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            maxLength: 100,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 100);

        migrationBuilder.AlterColumn<string>(
            name: "EventTypeCodSeniorTipEve",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "EventName",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            maxLength: 200,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 200);

        migrationBuilder.AlterColumn<decimal>(
            name: "EventAmount",
            table: "Payroll",
            type: "numeric(18,2)",
            nullable: true,
            oldClrType: typeof(decimal),
            oldType: "numeric(18,2)");

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CollaboratorTypeCodeSeniorTipCol",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "CalculationTypeName",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            maxLength: 200,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldMaxLength: 200);

        migrationBuilder.AlterColumn<string>(
            name: "CalculationTypeCodSeniorTipCal",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AddColumn<string>(
            name: "EventCodSeniorCodenv",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_Payroll_Employee_IdEmployee",
            table: "Payroll",
            column: "IdEmployee",
            principalTable: "Employee",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_SalaryHistory_Employee_IdEmployee",
            table: "SalaryHistory",
            column: "IdEmployee",
            principalTable: "Employee",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_Payroll_Employee_IdEmployee",
            table: "Payroll");

        migrationBuilder.DropForeignKey(
            name: "FK_SalaryHistory_Employee_IdEmployee",
            table: "SalaryHistory");

        migrationBuilder.DropColumn(
            name: "CompanyCodSeniorCodFil",
            table: "SalaryHistory");

        migrationBuilder.DropColumn(
            name: "MotiveName",
            table: "SalaryHistory");

        migrationBuilder.DropColumn(
            name: "EventCodSeniorCodenv",
            table: "Payroll");

        migrationBuilder.AlterColumn<string>(
            name: "MotiveCodSeniorCodMot",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
              name: "Id",
              table: "Employee",
              type: "uuid",
              nullable: false,
              oldClrType: typeof(string),
              oldType: "varchar(400)",
              oldUnicode: false);

        migrationBuilder.AlterColumn<Guid>(
            name: "IdEmployee",
            table: "SalaryHistory",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "SalaryHistory",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "ChangeDate",
            table: "SalaryHistory",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<DateTime>(
            name: "ReferenceDate",
            table: "Payroll",
            type: "date",
            nullable: false,
            defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
            oldClrType: typeof(DateTime),
            oldType: "date",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "PayrollPeriodCodSeniorCodCal",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "PayrollPeriodCod",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<Guid>(
            name: "IdEmployee",
            table: "Payroll",
            type: "uuid",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false);

        migrationBuilder.AlterColumn<string>(
            name: "EventTypeName",
            table: "Payroll",
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
            name: "EventTypeCodSeniorTipEve",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "EventName",
            table: "Payroll",
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

        migrationBuilder.AlterColumn<decimal>(
            name: "EventAmount",
            table: "Payroll",
            type: "numeric(18,2)",
            nullable: false,
            defaultValue: 0m,
            oldClrType: typeof(decimal),
            oldType: "numeric(18,2)",
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "EmployeeCodSeniorNumCad",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CompanyCodSeniorNumEmp",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CollaboratorTypeCodeSeniorTipCol",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AlterColumn<string>(
            name: "CalculationTypeName",
            table: "Payroll",
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
            name: "CalculationTypeCodSeniorTipCal",
            table: "Payroll",
            type: "varchar(400)",
            unicode: false,
            nullable: false,
            defaultValue: "",
            oldClrType: typeof(string),
            oldType: "varchar(400)",
            oldUnicode: false,
            oldNullable: true);

        migrationBuilder.AddForeignKey(
            name: "FK_Payroll_Employee_IdEmployee",
            table: "Payroll",
            column: "IdEmployee",
            principalTable: "Employee",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);

        migrationBuilder.AddForeignKey(
            name: "FK_SalaryHistory_Employee_IdEmployee",
            table: "SalaryHistory",
            column: "IdEmployee",
            principalTable: "Employee",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }
}
