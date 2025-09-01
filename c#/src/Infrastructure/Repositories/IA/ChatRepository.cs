using Application.Contracts.IA;
using Application.Interfaces.Repositories;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;
using Infrastructure.Contracts.IA.Chat.Request;
using Infrastructure.HttpClient.IA.Chat;
using Infrastructure.IA.Chat.Response;

namespace Infrastructure.Repositories.IA;

public class ChatRepository : IChatRepository
{
    private readonly IChatClient _chatClient;

    public ChatRepository(IChatClient chatClient)
    {
        _chatClient = chatClient;
    }

    public async Task<ErrorOr<ChatResponseModel>?> SendChatMessage(
        string idOrganization,
        Module module,
        string idAgent,
        string message
    )
    {
        var request = new ChatSessionRequest
        {
            User = new UserChatSession
            {
                IdUser = "string",
                Name = "string"
            },
            Message = message,
            ChatHistory = new ChatHistoryChatSession
            {
                Role = RoleChat.User,
                Content = "string"
            }
            
        };

        ChatSessionResponse? messageResponse = await _chatClient.SendChatMessage(request, idOrganization, module, idAgent);

        if (messageResponse is null)
        {
            return ChatSessionErrors.ChatMessageNotFound;
        }

        return new ChatResponseModel
        {
            MessageResponse = messageResponse.MessageResponse,
        };
    }

    Task<ErrorOr<ChatResponseModel?>> IChatRepository.SendChatMessage(string idOrganization, Module module, string idAgent, string Message)
    {
        throw new NotImplementedException();
    }
}
