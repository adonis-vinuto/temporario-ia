using Application.Common.Responses;
using Application.Interfaces.Data;
using Domain.Entities;

namespace Application.Interfaces.Repositories;

public interface IEmployeeRepository
{
    IUnitOfWork UnitOfWork { get; }

    Task AddAsync(Employee employee, CancellationToken cancellationToken);

    Task<Employee?> SearchByIdAsync(Guid idKnowledge, Guid idEmployee, CancellationToken cancellationToken);

    Task<Employee?> SearchByIdEmployeeAsync(Guid idEmployee, CancellationToken cancellationToken);

    public void Edit(Employee employee);

    Task<PagedResponse<Employee>> PagedSearchAsync(
        Guid idKnowledge,
        int pagina,
        int tamanhoPagina,
        CancellationToken cancellationToken
    );

    public void Remove(Employee employee);

}