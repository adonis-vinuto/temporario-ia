using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ErrorOr;
using Application.Contracts.Response;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services;

public class FileUploadService : IFileUploadService
{
    private readonly BlobContainerClient _filesContainer;


    public FileUploadService(IConfiguration configuration)
    {
        _filesContainer = new BlobContainerClient(configuration.GetConnectionString("GemelliApiBlobConnection")!,
        configuration.GetConnectionString("GemelliApiBlobContainerName"));
    }

    public async Task<ErrorOr<FileResponseModel>> GetAsync(string filename, CancellationToken cancellationToken)
    {
        BlobClient client = _filesContainer.GetBlobClient(filename);

        var file = new FileResponseModel(
            client.Uri.AbsoluteUri,
            client.Name,
            (await client.GetPropertiesAsync(null, cancellationToken)).Value.ContentType
        );

        return file;
    }

    public async Task<ErrorOr<FileResponseModel>> UploadAsync(
        IFormFile inputFile,
        CancellationToken cancellationToken
    )
    {
        BlobClient createClient = _filesContainer.GetBlobClient(Guid.NewGuid() + "-" + inputFile.FileName);

        await using (Stream data = inputFile.OpenReadStream())
        {
            await createClient.UploadAsync(
                data,
                new BlobHttpHeaders { ContentType = inputFile.ContentType },
                cancellationToken: cancellationToken
            );
        }

        var fileResponse = new FileResponseModel(
            createClient.Uri.AbsoluteUri,
            createClient.Name,
            inputFile.ContentType
        );

        return fileResponse;
    }

    public async Task<ErrorOr<bool>> DeleteAsync(string nomeArquivo, CancellationToken cancellationToken)
    {
        string lastNomeArquivo = Uri.UnescapeDataString(nomeArquivo.Split("/")[^1]);
        BlobClient blob = _filesContainer.GetBlobClient(lastNomeArquivo);
        await blob.DeleteIfExistsAsync(
            DeleteSnapshotsOption.IncludeSnapshots,
            cancellationToken: cancellationToken
        );
        return true;
    }
}
