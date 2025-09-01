using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Request;

public class ChatAIRequest
{
    [JsonPropertyName("user")]
    public UserInfo User { get; set; } = new();

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("chat-history")]
    public List<ChatHistoryItem> ChatHistory { get; set; } = new();

    [JsonPropertyName("tools")]
    public ToolsConfig Tools { get; set; } = new();
}

public class UserInfo
{
    [JsonPropertyName("id-user")]
    public string IdUser { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}

public class ChatHistoryItem
{
    [JsonPropertyName("role")]
    public int Role { get; set; }

    [JsonPropertyName("content")]
    public string Content { get; set; } = string.Empty;
}

public class ToolsConfig
{
    [JsonPropertyName("send_email")]
    public bool SendEmail { get; set; }

    [JsonPropertyName("fetch_employee_data")]
    public bool FetchEmployeeData { get; set; }

    [JsonPropertyName("web_search")]
    public bool WebSearch { get; set; }

    [JsonPropertyName("news_search")]
    public bool NewsSearch { get; set; }
}