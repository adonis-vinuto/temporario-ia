using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations.Tenant;

/// <inheritdoc />
public partial class AdicionaEntidadesPeople : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "File",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                FileName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                TotalPages = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                Summary = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 1000, nullable: false),
                Answer = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CompletionTokens = table.Column<int>(type: "integer", nullable: false),
                PromptTokens = table.Column<int>(type: "integer", nullable: false),
                TotalTokens = table.Column<int>(type: "integer", nullable: false),
                CompletionTime = table.Column<int>(type: "integer", nullable: false),
                PromptTime = table.Column<int>(type: "integer", nullable: false),
                QueueTime = table.Column<int>(type: "integer", nullable: false),
                TotalTime = table.Column<int>(type: "integer", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_File", x => x.Id);
                table.ForeignKey(
                    name: "FK_File_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Knowledge",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                Description = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 1000, nullable: false),
                Origin = table.Column<int>(type: "integer", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Knowledge", x => x.Id);
                table.ForeignKey(
                    name: "FK_Knowledge_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "TwilioConfig",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                AccountSid = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                AuthToken = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                WebhookUrl = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 1000, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TwilioConfig", x => x.Id);
                table.ForeignKey(
                    name: "FK_TwilioConfig_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Page",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdFile = table.Column<Guid>(type: "uuid", nullable: false),
                PageNumber = table.Column<int>(type: "integer", nullable: false),
                Title = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 255, nullable: false),
                Content = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                ResumePage = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                FileId = table.Column<Guid>(type: "uuid", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Page", x => x.Id);
                table.ForeignKey(
                    name: "FK_Page_File_IdFile",
                    column: x => x.IdFile,
                    principalTable: "File",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Employee",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdKnowledge = table.Column<Guid>(type: "uuid", nullable: false),
                CompanyName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                FullName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                AdmissionDate = table.Column<DateTime>(type: "date", nullable: false),
                TerminationDate = table.Column<DateTime>(type: "date", nullable: false),
                StatusDescription = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                BirthDate = table.Column<DateTime>(type: "date", nullable: false),
                CostCneterName = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                Salary = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                ComplementarySalary = table.Column<decimal>(type: "numeric(15,2)", nullable: false),
                SalaryEffectiveDate = table.Column<DateTime>(type: "date", nullable: false),
                Gender = table.Column<int>(type: "integer", nullable: false),
                StreetAddress = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                AddressNumber = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CityName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                Race = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                PostalCode = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CompanyCodSeniorNumEmp = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                EmployeeCodSeniorNumCad = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CollaboratorTypeCodeSeniorTipeCol = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                StatusCodSenior = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CostCenterCodSeniorCodCcu = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Employee", x => x.Id);
                table.ForeignKey(
                    name: "FK_Employee_Knowledge_IdKnowledge",
                    column: x => x.IdKnowledge,
                    principalTable: "Knowledge",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "SeniorErpConfig",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                IdKnowledge = table.Column<Guid>(type: "uuid", nullable: false),
                Username = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                Password = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                WsdlUrl = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 1000, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SeniorErpConfig", x => x.Id);
                table.ForeignKey(
                    name: "FK_SeniorErpConfig_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_SeniorErpConfig_Knowledge_IdKnowledge",
                    column: x => x.IdKnowledge,
                    principalTable: "Knowledge",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "SeniorHcmConfig",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdAgent = table.Column<Guid>(type: "uuid", nullable: false),
                IdKnowledge = table.Column<Guid>(type: "uuid", nullable: false),
                Username = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                Password = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                WsdlUrl = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 1000, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SeniorHcmConfig", x => x.Id);
                table.ForeignKey(
                    name: "FK_SeniorHcmConfig_Agents_IdAgent",
                    column: x => x.IdAgent,
                    principalTable: "Agents",
                    principalColumn: "Id");
                table.ForeignKey(
                    name: "FK_SeniorHcmConfig_Knowledge_IdKnowledge",
                    column: x => x.IdKnowledge,
                    principalTable: "Knowledge",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "Payroll",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdEmployee = table.Column<Guid>(type: "uuid", nullable: false),
                PayrollPeriodCod = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                EventName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                EventAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                EventTypeName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 100, nullable: false),
                ReferenceDate = table.Column<DateTime>(type: "date", nullable: false),
                CalculationTypeName = table.Column<string>(type: "varchar(400)", unicode: false, maxLength: 200, nullable: false),
                EmployeeCodSeniorNumCad = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CollaboratorTypeCodeSeniorTipCol = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CompanyCodSeniorNumEmp = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                PayrollPeriodCodSeniorCodCal = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                EventTypeCodSeniorTipEve = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CalculationTypeCodSeniorTipCal = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Payroll", x => x.Id);
                table.ForeignKey(
                    name: "FK_Payroll_Employee_IdEmployee",
                    column: x => x.IdEmployee,
                    principalTable: "Employee",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "SalaryHistory",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                IdEmployee = table.Column<Guid>(type: "uuid", nullable: false),
                ChangeDate = table.Column<DateTime>(type: "date", nullable: false),
                NewSalary = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                EmployeeCodSeniorNumCad = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CompanyCodSeniorNumEmp = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                MotiveCodSeniorCodMot = table.Column<string>(type: "varchar(400)", unicode: false, nullable: false),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SalaryHistory", x => x.Id);
                table.ForeignKey(
                    name: "FK_SalaryHistory_Employee_IdEmployee",
                    column: x => x.IdEmployee,
                    principalTable: "Employee",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateIndex(
            name: "IX_Employee_IdKnowledge",
            table: "Employee",
            column: "IdKnowledge");

        migrationBuilder.CreateIndex(
            name: "IX_File_IdAgent",
            table: "File",
            column: "IdAgent");

        migrationBuilder.CreateIndex(
            name: "IX_Knowledge_IdAgent",
            table: "Knowledge",
            column: "IdAgent");

        migrationBuilder.CreateIndex(
            name: "IX_Page_IdFile",
            table: "Page",
            column: "IdFile");

        migrationBuilder.CreateIndex(
            name: "IX_Payroll_IdEmployee",
            table: "Payroll",
            column: "IdEmployee");

        migrationBuilder.CreateIndex(
            name: "IX_SalaryHistory_IdEmployee",
            table: "SalaryHistory",
            column: "IdEmployee");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorErpConfig_IdAgent",
            table: "SeniorErpConfig",
            column: "IdAgent");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorErpConfig_IdKnowledge",
            table: "SeniorErpConfig",
            column: "IdKnowledge");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorHcmConfig_IdAgent",
            table: "SeniorHcmConfig",
            column: "IdAgent");

        migrationBuilder.CreateIndex(
            name: "IX_SeniorHcmConfig_IdKnowledge",
            table: "SeniorHcmConfig",
            column: "IdKnowledge");

        migrationBuilder.CreateIndex(
            name: "IX_TwilioConfig_IdAgent",
            table: "TwilioConfig",
            column: "IdAgent");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "Page");

        migrationBuilder.DropTable(
            name: "Payroll");

        migrationBuilder.DropTable(
            name: "SalaryHistory");

        migrationBuilder.DropTable(
            name: "SeniorErpConfig");

        migrationBuilder.DropTable(
            name: "SeniorHcmConfig");

        migrationBuilder.DropTable(
            name: "TwilioConfig");

        migrationBuilder.DropTable(
            name: "File");

        migrationBuilder.DropTable(
            name: "Employee");

        migrationBuilder.DropTable(
            name: "Knowledge");
    }
}
