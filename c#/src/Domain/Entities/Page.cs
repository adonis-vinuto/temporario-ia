namespace Domain.Entities;

public sealed class Page : BaseEntity
{
    public Guid IdFile { get; set; }
    public File File { get; set; }
    public int PageNumber { get; set; }
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string? ResumePage { get; set; }
}