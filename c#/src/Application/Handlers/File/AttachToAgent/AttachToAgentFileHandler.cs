using Application.Contracts.Response;
using Application.DTOs.File;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Entities;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;
using Mapster;

namespace Application.Handlers.File.AttachToAgent;

public class AttachToAgentFileHandler : BaseHandler
{
    private readonly IFileRepository _fileRepository;
    private readonly IAgentRepository _agentRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IModuleService _moduleService;

    public AttachToAgentFileHandler(IFileRepository fileRepository,
        IAuthenticationService authenticationService,
        IModuleService moduleService,
        IAgentRepository agentRepository)
    {
        _fileRepository = fileRepository;
        _authenticationService = authenticationService;
        _moduleService = moduleService;
        _agentRepository = agentRepository;
    }

    public async Task<ErrorOr<FileResponse>> Handle(AttachToAgentFileRequest request, Module module, CancellationToken cancellationToken)
    {
        if (Validate(request, new AttachToAgentFileRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();

        if (user is null)
        {
            return UserErrors.UserNotFound;
        }

        if (!_moduleService.HasAccessToModule(user, module))
        {
            return UserErrors.ModuleAccessDenied;
        }

        Domain.Entities.File? file = await _fileRepository.SearchByIdAsync(request.IdFile, module, cancellationToken);

        if (file is null)
        {
            return FileErrors.NotFound;
        }

        Domain.Entities.Agent agent = await _agentRepository.SearchByIdAsync(request.IdAgent, user.Organizations.FirstOrDefault()!, module, cancellationToken);

        if (agent is null)
        {
            return AgentErrors.AgentNotFound;
        }

        if (file.HasAgent(request.IdAgent))
        {
            file.RemoveAgent(agent);
        }
        else
        {
            file.AddAgent(agent);
        }

        _fileRepository.Update(file);
        await _fileRepository.UnitOfWork.Commit();

        FileResponse fileResponse = file.Adapt<FileResponse>();
        return fileResponse;
    }
}