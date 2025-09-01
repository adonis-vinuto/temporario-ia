using ErrorOr;

namespace Domain.Errors;

public static class ChatSessionErrors
{
    public static readonly Error ChatSessionNotFound = Error.NotFound(
        code: "ChatSession.NotFound",
        description: "Sessão de chat não encontrada.");

    public static readonly Error ChatMessageNotFound = Error.NotFound(
        code: "ChatMessage.NotFound",
        description: "Mensagem não encontrada.");
}