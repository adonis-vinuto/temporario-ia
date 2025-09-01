using Application.Common.Responses;
using Application.DTOs.File;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;
using ErrorOr;
using Mapster;

namespace Application.Handlers.File.Search;

public class SearchFilesHandler : BaseHandler
{
    private readonly IAuthenticationService _authenticationService;
    private readonly IModuleService _moduleService;
    private readonly IFileRepository _fileRepository;

    public SearchFilesHandler(
        IAuthenticationService authenticationService,
        IModuleService moduleService,
        IFileRepository fileRepository)
    {
        _authenticationService = authenticationService;
        _moduleService = moduleService;
        _fileRepository = fileRepository;
    }

    public async Task<ErrorOr<PagedResponse<FileResponse>>> Handle(SearchFilesRequest request, Module module, CancellationToken cancellationToken)
    {
        if (Validate(request, new SearchFilesRequestValidator()) is var resultado && resultado.Any())
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

        PagedResponse<Domain.Entities.File> pagedFiles = await _fileRepository.PagedSearchAsync(module, request.IdAgent, request.Pagina, request.TamanhoPagina, cancellationToken);

        List<FileResponse> filesResponse = pagedFiles!.Itens
            .Adapt<List<FileResponse>>();

        return PagedResponse<FileResponse>.Create(
            filesResponse,
            pagedFiles.TotalItens,
            pagedFiles.Indice,
            pagedFiles.TamanhoPagina);
    }
}