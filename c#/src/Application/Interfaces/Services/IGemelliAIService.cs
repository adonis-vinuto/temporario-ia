using ErrorOr;

namespace Application.Interfaces.Services;

public interface IGemelliAIService
{
    Task<ErrorOr<GemelliAIChatResponse>> SendChatMessageAsync(
        GemelliAIChatRequest request,
        CancellationToken cancellationToken = default);

    Task<ErrorOr<GemelliAIChatTwilioResponse>> SendChatMessageTwilioAsync(
        GemelliAIChatTwilioRequest request,
        CancellationToken cancellationToken = default);

    Task<ErrorOr<GemelliAITextResponse>> EnhanceTextAsync(
        string text,
        CancellationToken cancellationToken = default);
}
public class GemelliAIChatRequest
{
    public string IdOrganization { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string IdAgent { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<(int Role, string Content)> ChatHistory { get; set; } = new();
    public GemelliAITools Tools { get; set; } = new();
}

public class GemelliAITools
{
    public bool SendEmail { get; set; }
    public bool FetchEmployeeData { get; set; }
    public bool WebSearch { get; set; }
    public bool NewsSearch { get; set; }
}

public class GemelliAIChatTwilioRequest
{
    public string IdOrganization { get; set; } = string.Empty;
    public string Module { get; set; } = string.Empty;
    public string IdAgent { get; set; } = string.Empty;
    public string EmployeeId { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<(int Role, string Content)> ChatHistory { get; set; } = new();
}

public class GemelliAIChatResponse
{
    public string MessageResponse { get; set; } = string.Empty;
    public string ModelName { get; set; } = string.Empty;
    public int TotalTokens { get; set; }
}

public class GemelliAIChatTwilioResponse
{
    public string MessageResponse { get; set; } = string.Empty;
    public double TotalTime { get; set; }
    public int TotalTokens { get; set; }
}

public class GemelliAITextResponse
{
    public string EnhancedText { get; set; } = string.Empty;
    public double TotalTime { get; set; }
}