using KnowledgeBaseAssistant.Api.DTOs.Chat;
using KnowledgeBaseAssistant.Api.Extensions;
using KnowledgeBaseAssistant.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeBaseAssistant.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/chat")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost("ask")]
    public async Task<ActionResult<AskQuestionResponseDto>> Ask(
        AskQuestionRequestDto request,
        CancellationToken cancellationToken)
    {
        try
        {
            var userId = User.GetRequiredUserId();
            var response = await _chatService.AskAsync(userId, request, cancellationToken);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<ChatMessageDto>>> History(CancellationToken cancellationToken)
    {
        var userId = User.GetRequiredUserId();
        var history = await _chatService.GetHistoryAsync(userId, cancellationToken);

        return Ok(history);
    }
}
