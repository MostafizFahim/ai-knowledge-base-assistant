using System.ComponentModel.DataAnnotations;

namespace KnowledgeBaseAssistant.Api.DTOs.Chat;

public class AskQuestionRequestDto
{
    [Required]
    [MaxLength(1000)]
    public string Question { get; set; } = string.Empty;
}
