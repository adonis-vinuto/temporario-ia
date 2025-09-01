using Application.AppConfig;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Infrastructure.Common;
using Infrastructure.Context;
using Infrastructure.HttpClient.Handlers;
using Infrastructure.HttpClient.GemelliAI;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using GemelliApi.Infrastructure.Services;
using Refit;
using Infrastructure.HttpClient.IA.Chat;
using Infrastructure.Repositories.IA;

namespace Infrastructure.Extensions;

public static class InfrastructureExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddMemoryCache();

        services.AddDbContext<GemelliApiContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("GemelliApiDbConnection")
            ));

        services.AddDbContext<TenantDbContext>((serviceProvider, options) =>
        {
            ITenantProvider tenantProvider = serviceProvider.GetRequiredService<ITenantProvider>();

            string? connectionString = tenantProvider.GetConnectionString();

            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Tenant connection string not set.");
            }

            options.UseNpgsql(connectionString);
        });

        IConfigurationSection GemelliApiSection = configuration.GetSection(nameof(GemelliApiSettings));
        services.Configure<GemelliApiSettings>(GemelliApiSection);

        IConfigurationSection templateEmailSettingsSection = configuration.GetSection(nameof(TemplateEmailSettings));
        services.Configure<TemplateEmailSettings>(templateEmailSettingsSection);

        IConfigurationSection smtpSettingsSection = configuration.GetSection(nameof(SmtpSettings));
        services.Configure<SmtpSettings>(smtpSettingsSection);

        services.AddScoped<ITenantInitializer, TenantInitializer>();
        services.AddScoped<ITenantProvider, TenantProvider>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IFileUploadService, FileUploadService>();

        return services;
    }

    public static IServiceCollection AddRepositoriesServices(this IServiceCollection services)
    {
        services.AddScoped(typeof(IPaginacao<>), typeof(Paginacao<>));
        services.AddScoped<IDataConfigRepository, DataConfigRepository>();

        // Api
        services.AddScoped<IChatRepository, ChatRepository>();
        services.AddScoped<IAgentRepository, AgentRepository>();
        services.AddScoped<ITwilioConfigRepository, TwilioConfigRepository>();
        services.AddScoped<IKnowledgeRepository, KnowledgeRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<ISalaryHistoryRepository, SalaryHistoryRepository>();
        services.AddScoped<IPayrollRepository, PayrollRepository>();
        services.AddScoped<ISessionRepository, SessionRepository>();
        services.AddScoped<IChatHistoryRepository, ChatHistoryRepository>();
        services.AddScoped<IDashboardRepository, DashboardRepository>();

        // SeniorHcmConfig
        services.AddScoped<ISeniorHcmConfigRepository, SeniorHcmConfigRepository>();

        // SeniorErpConfig
        services.AddScoped<ISeniorErpConfigRepository, SeniorErpConfigRepository>();

        // Infra
        services.AddScoped<IFileRepository, FileRepository>();

        return services;
    }

    public static IServiceCollection AddRefitServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AuthHeaderHandler>();

        // Cliente GemelliAI - SIMPLES
        string gemelliAIBaseUrl = configuration["GemelliAISettings:BaseUrl"] ?? "";

        services.AddRefitClient<IGemelliAIClient>()
            .ConfigureHttpClient(c =>
            {
                c.BaseAddress = new Uri(gemelliAIBaseUrl);
                c.Timeout = TimeSpan.FromSeconds(30);
                c.DefaultRequestHeaders.Add("Accept", "application/json");
            });

        services.AddScoped<IGemelliAIService, GemelliAIService>();

        services.AddRefitClient<IChatClient>()
            .ConfigureHttpClient(c => c.DefaultRequestHeaders.Add("Accept", "application/json"));

        return services;
    }
}