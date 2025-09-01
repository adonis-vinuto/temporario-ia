using Application.Interfaces.Services;
using Domain.Errors;
using ErrorOr;
using Infrastructure.Contracts.GemelliAI.Request;
using Infrastructure.Contracts.GemelliAI.Response;
using Infrastructure.HttpClient.GemelliAI;
using Microsoft.Extensions.Logging;
using Refit;

namespace Infrastructure.Services;

public class GemelliAIService : IGemelliAIService
{
    private readonly IGemelliAIClient _client;
    private readonly ILogger<GemelliAIService> _logger;

    public GemelliAIService(
        IGemelliAIClient client,
        ILogger<GemelliAIService> logger)
    {
        _client = client;
        _logger = logger;
    }

    public async Task<ErrorOr<GemelliAIChatResponse>> SendChatMessageAsync(
        GemelliAIChatRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var apiRequest = new ChatAIRequest
            {
                User = new UserInfo
                {
                    IdUser = request.UserId,
                    Name = request.UserName
                },
                Message = request.Message,
                ChatHistory = request.ChatHistory.Select(h => new ChatHistoryItem
                {
                    Role = h.Role,
                    Content = h.Content
                }).ToList(),
                Tools = new ToolsConfig
                {
                    SendEmail = request.Tools.SendEmail,
                    FetchEmployeeData = request.Tools.FetchEmployeeData,
                    WebSearch = request.Tools.WebSearch,
                    NewsSearch = request.Tools.NewsSearch
                }
            };

            ChatAIResponse response = await _client.SendChatMessageAsync(
                apiRequest,
                request.IdOrganization,
                request.Module,
                request.IdAgent,
                cancellationToken);

            return new GemelliAIChatResponse
            {
                MessageResponse = response.MessageResponse,
                ModelName = response.Usage.ModelName,
                TotalTokens = response.Usage.TotalTokens
            };
        }
        catch (ApiException ex)
        {
            _logger.LogError(ex, "Erro ao chamar GemelliAI API - Status: {StatusCode}", ex.StatusCode);

            return ex.StatusCode switch
            {
                System.Net.HttpStatusCode.BadRequest => Error.Validation("GemelliAI.BadRequest", "Requisição inválida"),
                System.Net.HttpStatusCode.NotFound => Error.NotFound("GemelliAI.NotFound", "Recurso não encontrado"),
                _ => Error.Failure("GemelliAI.Error", $"Erro na API: {ex.Message}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao chamar GemelliAI API");
            return Error.Failure("GemelliAI.Error", "Erro inesperado ao processar requisição");
        }
    }

    public async Task<ErrorOr<GemelliAIChatTwilioResponse>> SendChatMessageTwilioAsync(
        GemelliAIChatTwilioRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var apiRequest = new ChatAITwilioRequest
            {
                User = new TwilioUserInfo
                {
                    IdEmployee = request.EmployeeId,
                    Name = request.EmployeeName
                },
                Message = request.Message,
                ChatHistory = request.ChatHistory.Select(h => new ChatHistoryItem
                {
                    Role = h.Role,
                    Content = h.Content
                }).ToList()
            };

            ChatAITwilioResponse response = await _client.SendChatMessageTwilioAsync(
                apiRequest,
                request.IdOrganization,
                request.Module,
                request.IdAgent,
                cancellationToken);

            return new GemelliAIChatTwilioResponse
            {
                MessageResponse = response.MessageResponse,
                TotalTime = response.Usage.TotalTime,
                TotalTokens = response.Usage.TotalTokens
            };
        }
        catch (ApiException ex)
        {
            _logger.LogError(ex, "Erro ao chamar GemelliAI Twilio API - Status: {StatusCode}", ex.StatusCode);
            return Error.Failure("GemelliAI.Twilio.Error", $"Erro na API: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao chamar GemelliAI Twilio API");
            return Error.Failure("GemelliAI.Twilio.Error", "Erro inesperado ao processar requisição");
        }
    }

    public async Task<ErrorOr<GemelliAITextResponse>> EnhanceTextAsync(
        string text,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new TextEnhancerRequest { Text = text };
            TextEnhancerResponse response = await _client.EnhanceTextAsync(request, cancellationToken);

            return new GemelliAITextResponse
            {
                EnhancedText = response.TextResponse,
                TotalTime = response.Usage.TotalTime
            };
        }
        catch (ApiException ex)
        {
            _logger.LogError(ex, "Erro ao chamar GemelliAI Text Enhancer API - Status: {StatusCode}", ex.StatusCode);
            return Error.Failure("GemelliAI.TextEnhancer.Error", $"Erro na API: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao chamar GemelliAI Text Enhancer API");
            return Error.Failure("GemelliAI.TextEnhancer.Error", "Erro inesperado ao processar requisição");
        }
    }
}