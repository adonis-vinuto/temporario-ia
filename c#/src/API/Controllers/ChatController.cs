using Application.DTOs.Chat;
using Application.Handlers.Chat.FirstMessage;
using Application.Handlers.Chat.SendMessage;
using Domain.Enums;
using ErrorOr;
using GemelliApi.API.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route("api/{module}/chat")]
[Authorize(Policy = "ModuleAccessPolicy")]
public class ChatController : MainController
{
    private readonly FirstMessageHandler _firstMessageHandler;
    private readonly SendChatMessageHandler _sendChatMessageHandler;

    public ChatController(
        FirstMessageHandler firstMessageHandler,
        SendChatMessageHandler sendChatMessageHandler)
    {
        _firstMessageHandler = firstMessageHandler;
        _sendChatMessageHandler = sendChatMessageHandler;
    }

    [HttpPost("{idAgent:guid}/first-message")]
    [ProducesResponseType(typeof(FirstMessageResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendFirstMessage(
        [FromRoute] Module module,
        [FromRoute] Guid idAgent,
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        ErrorOr<FirstMessageResponse> result = await _firstMessageHandler.Handle(
            new FirstMessageRequest(idAgent, request.Message),
            module,
            cancellationToken
        );

        return result.Match(
            chat => Ok(chat),
            errors => Problem(errors)
        );
    }

    /// <summary>
    /// Envia uma mensagem em uma sessão de chat existente
    /// </summary>
    [HttpPost("{idAgent:guid}/{idSession:guid}")]
    [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        [FromRoute] Module module,
        [FromRoute] Guid idAgent,
        [FromRoute] Guid idSession,
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        ErrorOr<ChatResponse> result = await _sendChatMessageHandler.Handle(
            new SendChatMessageRequest(idAgent, idSession, request.Message),
            module,
            cancellationToken
        );

        return result.IsError
            ? Problem(title: result.FirstError.Code, detail: result.FirstError.Description, statusCode: MapToHttpStatus(result.FirstError.Type))
            : Ok(result.Value);
    }
}