using Application.DTOs.Chat;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;

namespace Application.Handlers.Chat.SendMessage;

public class SendChatMessageHandler : BaseHandler
{
    private readonly IChatSessionRepository _chatSessionRepository;
    private readonly IChatHistoryRepository _chatHistoryRepository;
    private readonly IAgentRepository _agentRepository;
    private readonly IGemelliAIService _gemelliAIService;
    private readonly IAuthenticationService _authenticationService;
    private readonly IModuleService _moduleService;

    public SendChatMessageHandler(
        IChatSessionRepository chatSessionRepository,
        IChatHistoryRepository chatHistoryRepository,
        IAgentRepository agentRepository,
        IGemelliAIService gemelliAIService,
        IAuthenticationService authenticationService,
        IModuleService moduleService)
    {
        _chatSessionRepository = chatSessionRepository;
        _chatHistoryRepository = chatHistoryRepository;
        _agentRepository = agentRepository;
        _gemelliAIService = gemelliAIService;
        _authenticationService = authenticationService;
        _moduleService = moduleService;
    }

    public async Task<ErrorOr<ChatResponse>> Handle(
        SendChatMessageRequest request,
        Module module,
        CancellationToken cancellationToken = default)
    {
        // Validação
        if (Validate(request, new SendChatMessageRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        // Obter informações do usuário autenticado
        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();
        if (user is null)
        {
            return UserErrors.UserNotFound;
        }

        // Verificar acesso ao módulo
        if (!_moduleService.HasAccessToModule(user, module))
        {
            return UserErrors.ModuleAccessDenied;
        }

        // Obter organização do usuário
        string organization = user.Organizations?.FirstOrDefault() ?? "default";

        // Verificar se o agente existe
        Domain.Entities.Agent? agent = await _agentRepository.SearchByIdAsync(
            request.IdAgent,
            organization,
            module,
            cancellationToken
        );

        if (agent is null)
        {
            return AgentErrors.AgentNotFound;
        }

        // Buscar sessão de chat existente
        Domain.Entities.ChatSession? chatSession = await _chatSessionRepository.GetByIdWithHistoryAsync(
            request.IdSession,
            cancellationToken
        );

        if (chatSession is null)
        {
            return ChatSessionErrors.ChatSessionNotFound;
        }

        // Verificar se a sessão pertence ao agente correto
        if (chatSession.IdAgent != request.IdAgent)
        {
            return ChatSessionErrors.SessionAgentMismatch;
        }

        // Buscar histórico de conversas da sessão
        List<Domain.Entities.ChatHistory> chatHistory = await _chatHistoryRepository.GetHistoryBySessionAsync(
            request.IdSession,
            cancellationToken
        );

        // Preparar histórico para envio à API
        List<(int Role, string Content)> historyList = chatHistory
            .OrderBy(h => h.CreatedAt)
            .Select(h => ((int)h.Role, h.Content ?? ""))
            .ToList();

        // Chamar API GemelliAI
        GemelliAIChatRequest gemelliRequest = new()
        {
            IdOrganization = organization,
            Module = module.ToString().ToUpperInvariant(),
            IdAgent = request.IdAgent.ToString(),
            UserId = user.IdUser ?? "",
            UserName = user.Name ?? "",
            Message = request.Message,
            ChatHistory = historyList,
            Tools = new GemelliAITools
            {
                SendEmail = true,
                FetchEmployeeData = true,
                WebSearch = true,
                NewsSearch = true
            }
        };

        ErrorOr<GemelliAIChatResponse> aiResponse = await _gemelliAIService.SendChatMessageAsync(
            gemelliRequest,
            cancellationToken
        );

        if (aiResponse.IsError)
        {
            return aiResponse.FirstError;
        }

        // Atualizar informações da sessão
        chatSession.TotalInteractions += 1;
        chatSession.LastSendDate = DateTime.UtcNow;
        _chatSessionRepository.Update(chatSession);

        // Salvar histórico da mensagem do usuário
        Domain.Entities.ChatHistory userHistory = new()
        {
            Id = Guid.NewGuid(),
            IdChatSession = chatSession.Id,
            Content = request.Message,
            Role = RoleChat.User,
            TotalTokens = 0,
            TotalTime = 0,
            CreatedAt = DateTime.UtcNow
        };
        await _chatHistoryRepository.AddAsync(userHistory, cancellationToken);

        // Salvar histórico da resposta do sistema
        Domain.Entities.ChatHistory systemHistory = new()
        {
            Id = Guid.NewGuid(),
            IdChatSession = chatSession.Id,
            Content = aiResponse.Value.MessageResponse,
            Role = RoleChat.System,
            TotalTokens = aiResponse.Value.TotalTokens,
            TotalTime = 0,
            CreatedAt = DateTime.UtcNow
        };
        await _chatHistoryRepository.AddAsync(systemHistory, cancellationToken);

        // Commit das alterações
        await _chatSessionRepository.UnitOfWork.Commit();

        return new ChatResponse
        {
            MessageResponse = aiResponse.Value.MessageResponse
        };
    }
}