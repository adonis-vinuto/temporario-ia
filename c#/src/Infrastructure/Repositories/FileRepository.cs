
using Application.Common.Responses;
using Application.Interfaces.Data;
using Application.Interfaces.Repositories;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class FileRepository : IFileRepository
{
    public IUnitOfWork UnitOfWork => _context;
    private readonly TenantDbContext _context;

    public FileRepository(TenantDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Domain.Entities.File file, CancellationToken cancellationToken)
    {
        await _context.Files.AddAsync(file, cancellationToken);
    }

    public async Task<Domain.Entities.File?> SearchByIdAsync(Guid idFile, Module module, CancellationToken cancellationToken)
    {
        return await _context.Files
            .Include(x => x.Agents)
            .FirstOrDefaultAsync(
                x => x.Id == idFile, cancellationToken
            );
    }

    public void Update(Domain.Entities.File file)
    {
        _context.Files.Update(file);
    }

    public void Remove(Domain.Entities.File file)
    {
        _context.Files.Remove(file);
    }

    public async Task<PagedResponse<Domain.Entities.File>> PagedSearchAsync(
        Module module,
        Guid? idAgent,
        int pagina,
        int tamanhoPagina,
        CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.File> query = _context.Files
            .Include(x => x.Agents)
            .AsNoTracking().Where(x => x.Module == module);

        if (idAgent != null)
        {
            query = query.Where(x => x.Agents != null && x.Agents.Any(x => x.Id == idAgent));
        }

        int totalItens = await query.CountAsync(cancellationToken);

        List<Domain.Entities.File> itens = await query
            .OrderBy(a => a.CreatedAt)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .ToListAsync(cancellationToken);

        return PagedResponse<Domain.Entities.File>.Create(
            itens,
            totalItens,
            pagina,
            tamanhoPagina
        );
    }
}
