using Domain.Enums;
using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace Application.Handlers.File.Create;

public record CreateFileRequest(
    IFormFile Arquivo
);


public class CreateFileRequestValidator : AbstractValidator<CreateFileRequest>
{
    public CreateFileRequestValidator()
    {

        RuleFor(x => x.Arquivo)
            .NotEmpty()
            .WithMessage("Um arquivo deve ser anexado.")
            .Must(x => x is { Length: <= 30 * 1024 * 1024 })
            .WithMessage("O arquivo anexado não pode exceder 30 MB.")
            .Must(x => x != null && !ContemExtensaoProibida(x.FileName))
            .WithMessage("Tipos de arquivo não permitidos.");
    }
    
    private static readonly string[] ExtensoesProibidas = [".bat", ".sh", ".cmd", ".exe", ".js", ".ps1", ".vbs"];

    private static bool ContemExtensaoProibida(string fileName)
    {
        string? extensao = Path.GetExtension(fileName)?.ToLower(System.Globalization.CultureInfo.CurrentCulture);
        return extensao != null && ExtensoesProibidas.Contains(extensao);
    }
}
