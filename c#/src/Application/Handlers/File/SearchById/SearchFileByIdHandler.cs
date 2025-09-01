using ErrorOr;
using MapsterMapper;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Authentication.Models;
using Domain.Enums;
using Domain.Errors;
using Application.Contracts.Response;
using Application.DTOs.File;

namespace Application.Handlers.File.SearchById;

public class SearchFileByIdHandler : BaseHandler
{
    private readonly IFileRepository _fileRepository;
    private readonly IAuthenticationService _authenticationService;
    private readonly IMapper _mapper;

    public SearchFileByIdHandler(IFileRepository fileRepository, IMapper mapper, IAuthenticationService authenticationService)
    {
        _fileRepository = fileRepository;
        _mapper = mapper;
        _authenticationService = authenticationService;
    }

    public async Task<ErrorOr<FileResponse>> Handle(SearchFileByIdRequest request, Module module, CancellationToken cancellationToken = default)
    {
        if (Validate(request, new SearchFileByIdRequestValidator()) is var resultado && resultado.Any())
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

        return _mapper.Map<FileResponse>(file);
    }
}