using Domain.Enums;
using FluentValidation;

namespace Application.Handlers.DataConfig.Create;

public record SendMessageRequest(
    Module Module,
 //  Guid IdAgent,
 //  Guid IdSession,
    string Message
);

public class SendMessageRequestValidator : AbstractValidator<SendMessageRequest>
{
    public SendMessageRequestValidator()
    {
        RuleFor(x => x.Module)
            .IsInEnum().WithMessage("O módulo deve ser People, Finance ou Sales.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("A mensagem é obrigatória.")
            .Length(1, 1000).WithMessage("A mensagem deve conter entre {MinLength} e {MaxLength} caracteres.");
   
    }
}