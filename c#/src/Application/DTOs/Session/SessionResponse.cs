namespace Application.DTOs.Session;

public class SessionResponse
{
   public string? SessionId { get; set; }
   public string? LastSendDate { get; set; }
   public string? TotalInteractions { get; set; }
}