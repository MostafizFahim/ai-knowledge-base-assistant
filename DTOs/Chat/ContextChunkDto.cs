namespace KnowledgeBaseAssistant.Api.DTOs.Chat;

public class ContextChunkDto
{
    public Guid DocumentId { get; set; }
    public string DocumentTitle { get; set; } = string.Empty;
    public int ChunkIndex { get; set; }
    public string Content { get; set; } = string.Empty;
    public int Score { get; set; }
}
