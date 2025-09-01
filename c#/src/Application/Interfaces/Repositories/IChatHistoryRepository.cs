using Application.Interfaces.Data;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IChatHistoryRepository
{
    IUnitOfWork UnitOfWork { get; }

    Task<ChatHistory?> SearchChatHistoryByIdSession(Guid idSession, Module module, CancellationToken cancellationToken);
}