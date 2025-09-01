using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Response;

public class TextEnhancerResponse
{
    [JsonPropertyName("text-response")]
    public string TextResponse { get; set; } = string.Empty;

    [JsonPropertyName("usage")]
    public TwilioUsageInfo Usage { get; set; } = new();
}