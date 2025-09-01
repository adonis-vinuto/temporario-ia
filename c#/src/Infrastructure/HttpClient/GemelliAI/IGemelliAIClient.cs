using Infrastructure.Contracts.GemelliAI.Request;
using Infrastructure.Contracts.GemelliAI.Response;
using Refit;

namespace Infrastructure.HttpClient.GemelliAI;

public interface IGemelliAIClient
{
    [Post("/api/chat-ai/{idOrganization}/{module}/{idAgent}")]
    Task<ChatAIResponse> SendChatMessageAsync(
        [Body] ChatAIRequest request,
        string idOrganization,
        string module, // "people", "sales", "finance"
        string idAgent,
        CancellationToken cancellationToken = default);

    [Post("/api/chat-ai-twilio/{idOrganization}/{module}/{idAgent}")]
    Task<ChatAITwilioResponse> SendChatMessageTwilioAsync(
        [Body] ChatAITwilioRequest request,
        string idOrganization,
        string module, // "people", "sales", "finance"
        string idAgent,
        CancellationToken cancellationToken = default);

    [Post("/api/text-enhancer")]
    Task<TextEnhancerResponse> EnhanceTextAsync(
        [Body] TextEnhancerRequest request,
        CancellationToken cancellationToken = default);
}