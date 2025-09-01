using Application.Contracts.Response;
using Application.DTOs.File;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;
using Mapster;

namespace Application.Handlers.File.Remove;

public sealed class RemoveFileHandler : BaseHandler
{
    private readonly IFileRepository _fileRepository;
    private readonly IAuthenticationService _authenticationService;

    public RemoveFileHandler(IFileRepository fileRepository,
        IAuthenticationService authenticationService)
    {
        _fileRepository = fileRepository;
        _authenticationService = authenticationService;
    }

    public async Task<ErrorOr<FileResponse>> Handle(RemoveFileRequest request, Module module, CancellationToken cancellationToken)
    {
        if (Validate(request, new RemoveFileRequestValidator()) is var resultado && resultado.Any())
        {
            return resultado;
        }

        UserAuthInfoResponse user = _authenticationService.GetUserAuthInfo();

        if (user is null)
        {
            return UserErrors.UserNotFound;
        }

        Domain.Entities.File? file = await _fileRepository.SearchByIdAsync(request.Id, module, cancellationToken);

        if (file is null)
        {
            return FileErrors.NotFound;
        }

        _fileRepository.Remove(file);
        await _fileRepository.UnitOfWork.Commit();

        FileResponse fileResponse = file.Adapt<FileResponse>();
        return fileResponse;
    }
}