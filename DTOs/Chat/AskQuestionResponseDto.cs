namespace KnowledgeBaseAssistant.Api.DTOs.Chat;

public class AskQuestionResponseDto
{
    public string Answer { get; set; } = string.Empty;
    public IReadOnlyList<ContextChunkDto> ContextUsed { get; set; } = Array.Empty<ContextChunkDto>();
}
