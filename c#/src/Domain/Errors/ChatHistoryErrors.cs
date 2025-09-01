using ErrorOr;

namespace Domain.Errors;

public static class ChatHistoryErrors
{
    public static readonly Error ChatHistoryNotFound = Error.NotFound(
        code: "ChatHistory.NotFound",
        description: "Histórico de chat não encontrado.");
}