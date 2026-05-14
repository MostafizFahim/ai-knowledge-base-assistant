namespace KnowledgeBaseAssistant.Api.DTOs.Documents;

public class DocumentListItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public int ChunkCount { get; set; }
}
