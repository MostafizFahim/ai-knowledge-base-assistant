using System.ComponentModel.DataAnnotations;

namespace KnowledgeBaseAssistant.Api.DTOs.Documents;

public class UploadDocumentRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public IFormFile? File { get; set; }
}
