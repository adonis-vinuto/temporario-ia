using ErrorOr;

namespace Domain.Errors;

public static class AgentErrors
{
    public static readonly Error AgentNotFound = Error.NotFound(
        code: "Agent.NotFound",
        description: "Agente não encontrado.");
}