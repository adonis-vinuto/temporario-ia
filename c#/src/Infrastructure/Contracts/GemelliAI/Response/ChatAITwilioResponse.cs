using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Response;

public class ChatAITwilioResponse
{
    [JsonPropertyName("message-response")]
    public string MessageResponse { get; set; } = string.Empty;

    [JsonPropertyName("usage")]
    public TwilioUsageInfo Usage { get; set; } = new();
}

public class TwilioUsageInfo
{
    [JsonPropertyName("queue-time")]
    public double QueueTime { get; set; }

    [JsonPropertyName("prompt-tokens")]
    public int PromptTokens { get; set; }

    [JsonPropertyName("prompt-time")]
    public double PromptTime { get; set; }

    [JsonPropertyName("completion-tokens")]
    public int CompletionTokens { get; set; }

    [JsonPropertyName("completion-time")]
    public double CompletionTime { get; set; }

    [JsonPropertyName("total-tokens")]
    public int TotalTokens { get; set; }

    [JsonPropertyName("total-time")]
    public double TotalTime { get; set; }
}