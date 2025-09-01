using Application.Handlers;
using ErrorOr;
using MapsterMapper;
using Application.DTOs.Agent;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;

namespace Application.Handlers.Agent.SearchById;

public class SearchAgentByIdHandler : BaseHandler
{
    private readonly IAgentRepository _agentRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IMapper _mapper;

    public SearchAgentByIdHandler(IAgentRepository agentRepository, IMapper mapper, IAuthenticationService authenticationService)
    {
        _agentRepository = agentRepository;
        _mapper = mapper;
        _authenticationService = authenticationService;
    }

    public async Task<ErrorOr<AgentResponse>> Handle(SearchAgentByIdRequest request, Module module, CancellationToken cancellationToken = default)
    {
        if (Validate(request, new SearchAgentByIdRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }
        
        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();

        if (user is null)
        {
            return UserErrors.UserNotFound;
        }
        
        Domain.Entities.Agent? agent = await _agentRepository.SearchByIdAsync(request.Id, user.Organizations.FirstOrDefault()!, module,cancellationToken);

        if (agent is null)
        {
            return AgentErrors.AgentNotFound;
        }

        return _mapper.Map<AgentResponse>(agent);
    }
}