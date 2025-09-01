using Application.Interfaces.Services;
using Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services;

public class TenantInitializer : ITenantInitializer
{
    public async Task EnsureDatabaseMigrated(string connectionString)
    {
        var optionsBuilder = new DbContextOptionsBuilder<TenantDbContext>();
        optionsBuilder.UseNpgsql(connectionString);

        await using var db = new TenantDbContext(optionsBuilder.Options);
        await db.Database.MigrateAsync();
    }
}