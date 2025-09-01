using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.ModelConfig.Tenant;

public sealed class SalaryHistoryConfiguration : IEntityTypeConfiguration<SalaryHistory>
{
    public void Configure(EntityTypeBuilder<SalaryHistory> builder)
    {
        builder.ToTable("SalaryHistory");

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

        builder.Property(x => x.ChangeDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(x => x.NewSalary)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.EmployeeCodSeniorNumCad)
            .IsRequired();

        builder.Property(x => x.CompanyCodSeniorNumEmp)
            .IsRequired();

        builder.Property(x => x.MotiveCodSeniorCodMot)
            .IsRequired();

    }
}