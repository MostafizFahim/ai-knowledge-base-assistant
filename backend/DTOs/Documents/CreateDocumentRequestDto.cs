using System.ComponentModel.DataAnnotations;

namespace KnowledgeBaseAssistant.Api.DTOs.Documents;

public class CreateDocumentRequestDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public string Content { get; set; } = string.Empty;
}
