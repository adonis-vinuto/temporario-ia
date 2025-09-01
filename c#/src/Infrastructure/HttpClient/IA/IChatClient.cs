using System.Runtime.CompilerServices;
using Domain.Enums;
using Infrastructure.Contracts.IA.Chat.Request;
using Infrastructure.IA.Chat.Response;
using Refit;

namespace Infrastructure.HttpClient.IA.Chat;

public interface IChatClient
{
   [Post("/api/v1/chat-ai/{idOrganization}/{module}/{idAgent}")]
    Task<ChatSessionResponse> SendChatMessage(
        ChatSessionRequest request, string idOrganization, Module module, string idAgent);
}