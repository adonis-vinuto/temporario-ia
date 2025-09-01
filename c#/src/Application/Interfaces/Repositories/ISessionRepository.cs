using Application.Interfaces.Data;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface ISessionRepository
{
    IUnitOfWork UnitOfWork { get; }

    Task<ChatSession> SearchChatSessionByIdAgent(Guid idAgent, Module module, CancellationToken cancellationToken);

    Task<ChatSession> SearchChatSessionTwilioByIdAgent(Guid idAgent, Module module, CancellationToken cancellationToken);

}