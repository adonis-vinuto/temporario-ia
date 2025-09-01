namespace Application.Interfaces.Services;

public interface ITenantInitializer
{
    Task EnsureDatabaseMigrated(string connectionString);
}