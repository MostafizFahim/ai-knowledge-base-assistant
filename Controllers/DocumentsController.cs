using KnowledgeBaseAssistant.Api.DTOs.Documents;
using KnowledgeBaseAssistant.Api.Extensions;
using KnowledgeBaseAssistant.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KnowledgeBaseAssistant.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/documents")]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpPost]
    public async Task<ActionResult<DocumentListItemDto>> Create(
        CreateDocumentRequestDto request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetRequiredUserId();
        try
        {
            var document = await _documentService.CreateAsync(userId, request, cancellationToken);
            return Created($"/api/documents/{document.Id}", document);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DocumentListItemDto>>> List(CancellationToken cancellationToken)
    {
        var userId = User.GetRequiredUserId();
        var documents = await _documentService.ListAsync(userId, cancellationToken);

        return Ok(documents);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = User.GetRequiredUserId();
        var deleted = await _documentService.DeleteAsync(userId, id, cancellationToken);

        return deleted ? NoContent() : NotFound(new { message = "Document not found." });
    }
}
