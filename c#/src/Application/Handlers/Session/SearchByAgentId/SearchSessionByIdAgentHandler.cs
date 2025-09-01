using ErrorOr;
using MapsterMapper;
using Application.DTOs.Session;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;

namespace Application.Handlers.Session.SearchByIdAgent;

public class SearchSessionByIdAgentHandler : BaseHandler
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IMapper _mapper;

    public SearchSessionByIdAgentHandler(
        ISessionRepository sessionRepository,
        IAuthenticationService authenticationService,
        IMapper mapper)
    {
        _sessionRepository = sessionRepository;
        _authenticationService = authenticationService;
        _mapper = mapper;
    }

    public async Task<ErrorOr<SessionResponse>> Handle(
        SearchSessionByIdAgentRequest request,
        Module module,
        CancellationToken cancellationToken = default)
    {
        if (Validate(request, new SearchSessionByIdAgentRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();

        if (user is null)
        {
            return UserErrors.UserNotFound;
        }

        if (user.IdUser != request.IdUser.ToString())
        {
            return UserErrors.UserNotFound;
        }

        Domain.Entities.ChatSession? session = await _sessionRepository.SearchChatSessionByIdAgent(
            request.IdAgent,
            module,
            cancellationToken);

        if (session is null)
        {
            return ChatSessionErrors.ChatSessionNotFound;
        }

        return _mapper.Map<SessionResponse>(session);
    }
}