using System.Text.Json.Serialization;

namespace Infrastructure.Contracts.GemelliAI.Request;

public class TextEnhancerRequest
{
    [JsonPropertyName("text")]
    public string Text { get; set; } = string.Empty;
}