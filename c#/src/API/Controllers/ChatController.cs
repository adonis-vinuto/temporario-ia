using Application.DTOs.ChatSession;
using Application.Handlers.DataConfig.Create;
using ErrorOr;
using Microsoft.AspNetCore.Mvc;
using GemelliApi.API.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;

[Route("api/people/chat-ai")]
[Authorize(Policy = "ModuleAccessPolicy")]
public class ChatAiController : MainController
{
    private readonly SendMessageHandler _sendMessageHandler;

    public ChatAiController(SendMessageHandler sendMessageHandler)
    {
        _sendMessageHandler = sendMessageHandler;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ChatSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        ErrorOr<ChatSessionResponse> result = await _sendMessageHandler.Handle(request);

        return result.Match(
            ChatSessionResponse => Ok(ChatSessionResponse),
            errors => Problem(errors)
        );
    }
}