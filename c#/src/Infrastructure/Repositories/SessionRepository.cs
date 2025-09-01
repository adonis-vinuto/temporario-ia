using Application.Interfaces.Data;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    public IUnitOfWork UnitOfWork => _context;
    private readonly TenantDbContext _context;

    public SessionRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<ChatSession> SearchChatSessionByIdAgent(
        Guid idAgent,
        Module module,
        CancellationToken cancellationToken)
    {
        return await _context.Chats
            .Include(x => x.Agent)
            .FirstOrDefaultAsync(
                x => x.IdAgent == idAgent &&
                    x.Agent.Module == module, cancellationToken
            );
    }

    public async Task<ChatSession> SearchChatSessionTwilioByIdAgent(
        Guid idAgent,
        Module module,
        CancellationToken cancellationToken)
    {
        return await _context.Chats
            .Include(x => x.Agent)
            .FirstOrDefaultAsync(
                x => x.IdAgent == idAgent &&
                    x.Agent.Module == module, cancellationToken
            );
    }
}
