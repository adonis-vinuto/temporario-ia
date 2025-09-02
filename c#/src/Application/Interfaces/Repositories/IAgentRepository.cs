using Application.Common.Responses;
using Application.Interfaces.Data;
using Domain.Entities;
using Domain.Enums;

namespace Application.Interfaces.Repositories;

public interface IAgentRepository
{
    IUnitOfWork UnitOfWork { get; }
    Task<Agent?> SearchByIdAsync(Guid idAgent, string organization, Module module, CancellationToken cancellationToken);

    public void Edit(Agent agent);

    Task<PagedResponse<Agent>> PagedSearchAsync(
        string organization,
        Module module,
        int pagina,
        int tamanhoPagina,
        CancellationToken cancellationToken
    );

    public void Remove(Agent agent);
}