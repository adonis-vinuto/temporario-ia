using ErrorOr;
using MapsterMapper;
using Application.DTOs.ChatHistory;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;

namespace Application.Handlers.ChatHistory.SearchByIdAgent;

public class SearchChatHistoryByIdAgentHandler : BaseHandler
{
    private readonly IChatHistoryRepository _chatHistoryRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IMapper _mapper;

    public SearchChatHistoryByIdAgentHandler(
        IChatHistoryRepository chatHistoryRepository,
        IAuthenticationService authenticationService,
        IMapper mapper)
    {
        _chatHistoryRepository = chatHistoryRepository;
        _authenticationService = authenticationService;
        _mapper = mapper;
    }

    public async Task<ErrorOr<ChatHistoryResponse>> Handle(
        SearchChatHistoryByIdAgentRequest request,
        Module module,
        CancellationToken cancellationToken = default)
    {
        if (Validate(request, new SearchChatHistoryByIdAgentRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();

        if (user is null)
        {
            return UserErrors.UserNotFound;
        }

        Domain.Entities.ChatHistory? chatHistory = await _chatHistoryRepository.SearchChatHistoryByIdSession(
            request.IdSession,
            module,
            cancellationToken);

        if (chatHistory is null)
        {
            return ChatHistoryErrors.ChatHistoryNotFound;
        }

        return _mapper.Map<ChatHistoryResponse>(chatHistory);
    }
}