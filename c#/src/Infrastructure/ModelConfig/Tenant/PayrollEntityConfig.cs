using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.ModelConfig.Tenant;

public sealed class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
{
    public void Configure(EntityTypeBuilder<Payroll> builder)
    {
        builder.ToTable("Payroll");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .IsRequired()
            .ValueGeneratedOnAdd();

        builder.Property(x => x.IdEmployee)
            .IsRequired();
        
        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.IdEmployee)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(x => x.PayrollPeriodCod)
            .IsRequired();

        builder.Property(x => x.EventName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.EventAmount)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.EventTypeName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ReferenceDate)
            .IsRequired()
            .HasColumnType("date");

        builder.Property(x => x.CalculationTypeName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.EmployeeCodSeniorNumCad)
            .IsRequired();

        builder.Property(x => x.CollaboratorTypeCodeSeniorTipCol)
            .IsRequired();

        builder.Property(x => x.CompanyCodSeniorNumEmp)
            .IsRequired();

        builder.Property(x => x.PayrollPeriodCodSeniorCodCal)
            .IsRequired();

        builder.Property(x => x.EventTypeCodSeniorTipEve)
            .IsRequired();

        builder.Property(x => x.CalculationTypeCodSeniorTipCal)
            .IsRequired();

    }
}