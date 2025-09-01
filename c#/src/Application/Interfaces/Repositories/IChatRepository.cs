
using Application.Contracts.IA;
using Application.Interfaces.Data;
using Domain.Enums;
using ErrorOr;

namespace Application.Interfaces.Repositories;

public interface IChatRepository
{

    Task<ErrorOr<ChatResponseModel?>> SendChatMessage(
        string idOrganization,
        Module module,
        string idAgent,
        string Message
    );
}
