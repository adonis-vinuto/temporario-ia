using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Response;

public class ChatAIResponse
{
    [JsonPropertyName("message-response")]
    public string MessageResponse { get; set; } = string.Empty;

    [JsonPropertyName("usage")]
    public UsageInfo Usage { get; set; } = new();
}

public class UsageInfo
{
    [JsonPropertyName("model-name")]
    public string ModelName { get; set; } = string.Empty;

    [JsonPropertyName("finish-reason")]
    public string FinishReason { get; set; } = string.Empty;

    [JsonPropertyName("input-tokens")]
    public int InputTokens { get; set; }

    [JsonPropertyName("output-tokens")]
    public int OutputTokens { get; set; }

    [JsonPropertyName("total-tokens")]
    public int TotalTokens { get; set; }
}