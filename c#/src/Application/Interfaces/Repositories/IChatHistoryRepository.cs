using Application.Interfaces.Data;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IChatHistoryRepository
{
    IUnitOfWork UnitOfWork { get; }
    Task<Domain.Entities.ChatHistory?> SearchChatHistoryByIdSession(Guid idSession, Module module, CancellationToken cancellationToken);
    Task<List<Domain.Entities.ChatHistory>> GetHistoryBySessionAsync(Guid idSession, CancellationToken cancellationToken);
    Task AddAsync(Domain.Entities.ChatHistory chatHistory, CancellationToken cancellationToken);
}