using Application.Common.Responses;
using Application.Interfaces.Data;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class AgentRepository : IAgentRepository
{
    public IUnitOfWork UnitOfWork => _context;
    private readonly TenantDbContext _context;

    public AgentRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task<Agent?> SearchByIdAsync(
        Guid idAgent,
        string organization,
        Module module,
        CancellationToken cancellationToken)
    {
        return await _context.Agents
            .Include(x => x.Knowledges)
            .Include(x => x.Files)
            .Include(x => x.SeniorErpConfigs)
            .Include(x => x.SeniorHcmConfigs)
            .FirstOrDefaultAsync(
                x => x.Id == idAgent &&
                     x.Organization == organization &&
                     x.Module == module,
                cancellationToken
            );
    }

    public async Task<List<Agent>> SearchAllAsync(
        Module module,
        CancellationToken cancellationToken)
    {
        return await _context.Agents
            .Where(x => x.Module == module)
            .Include(x => x.Knowledges)
            .Include(x => x.Files)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResponse<Agent>> PagedSearchAsync(
        string organization,
        Module module,
        int pagina,
        int tamanhoPagina,
        CancellationToken cancellationToken)
    {
        IQueryable<Agent> query = _context.Agents
            .AsNoTracking().Where(x => x.Organization == organization && x.Module == module);

        int totalItens = await query.CountAsync(cancellationToken);

        List<Agent> itens = await query
            .OrderBy(a => a.CreatedAt)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(cancellationToken);

        return PagedResponse<Agent>.Create(
            itens,
            totalItens,
            pagina,
            tamanhoPagina
        );
    }

    public async Task AddAsync(Agent agent, CancellationToken cancellationToken)
    {
        await _context.Agents.AddAsync(agent, cancellationToken);
    }

    public void Edit(Agent agent)
    {
        _context.Agents.Update(agent);
    }

    public void Remove(Agent agent)
    {
        _context.Agents.Remove(agent);
    }
}