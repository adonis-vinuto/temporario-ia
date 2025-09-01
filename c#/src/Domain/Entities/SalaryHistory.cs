
namespace Domain.Entities;

public class SalaryHistory : BaseEntity
{
    public Guid IdEmployee { get; set; }
    public Employee Employee { get; set; }
    public DateTime? ChangeDate { get; set; }
    public decimal NewSalary { get; set; }
    public string? EmployeeCodSeniorNumCad { get; set; }
    public string? CompanyCodSeniorNumEmp { get; set; }
    public string? MotiveCodSeniorCodMot { get; set; }
}
