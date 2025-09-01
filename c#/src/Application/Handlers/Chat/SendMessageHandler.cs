using Application.Contracts.IA;
using Application.DTOs.ChatSession;
using Application.Interfaces.Repositories;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;
using Mapster;

namespace Application.Handlers.DataConfig.Create;

public class SendMessageHandler : BaseHandler
{
    private readonly IChatRepository _chatRepository;

    public SendMessageHandler(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    public async Task<ErrorOr<ChatSessionResponse>> Handle(SendMessageRequest request)
    {
        if (Validate(request, new SendMessageRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        // Chamar api do chat de pessoas
        // retornar resposta no response
        string idOrganization = "1"; // Remover essas strings hard coded
        string idAgent = "1111";

        // Validar se a organização e o agente existem

        ErrorOr<ChatResponseModel?> response = await _chatRepository.SendChatMessage(
            idOrganization,
            Module.People,
            idAgent,
            request.Message
        );

        if (response.Value == null)
        {
            return ChatSessionErrors.ChatMessageNotFound;
        }

        // Salvar chat no banco

        return new ChatSessionResponse
        {
            MessageResponsse = response.Value.MessageResponse
        };
    }
}
