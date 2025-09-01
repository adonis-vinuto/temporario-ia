using ErrorOr;
using Application.Contracts.Response;
using Microsoft.AspNetCore.Http;

namespace Application.Interfaces.Services;

public interface IFileUploadService
{
    Task<ErrorOr<FileResponseModel>> GetAsync(string filename, CancellationToken cancellationToken);
    Task<ErrorOr<bool>> DeleteAsync(string nomeArquivo, CancellationToken cancellationToken);
    Task<ErrorOr<FileResponseModel>> UploadAsync(
        IFormFile inputFile,
        CancellationToken cancellationToken
    );
}
