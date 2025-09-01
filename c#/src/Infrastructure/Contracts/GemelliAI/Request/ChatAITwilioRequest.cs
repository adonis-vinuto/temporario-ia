using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Request;

public class ChatAITwilioRequest
{
    [JsonPropertyName("user")]
    public TwilioUserInfo User { get; set; } = new();

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("chat-history")]
    public List<ChatHistoryItem> ChatHistory { get; set; } = new();
}

public class TwilioUserInfo
{
    [JsonPropertyName("id-employee")]
    public string IdEmployee { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
}