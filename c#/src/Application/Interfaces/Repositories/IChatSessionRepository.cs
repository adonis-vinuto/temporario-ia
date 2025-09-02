using Application.Interfaces.Data;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IChatSessionRepository
{
    IUnitOfWork UnitOfWork { get; }
    Task<ChatSession?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<ChatSession?> GetByIdWithHistoryAsync(Guid id, CancellationToken cancellationToken);
    Task<ChatSession?> GetByAgentAndUserAsync(Guid idAgent, Guid idUser, Module module, CancellationToken cancellationToken);
    Task AddAsync(ChatSession chatSession, CancellationToken cancellationToken);
    void Update(ChatSession chatSession);
}