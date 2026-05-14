namespace KnowledgeBaseAssistant.Api.Entities;

public class DocumentChunk
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public int ChunkIndex { get; set; }
    public string Content { get; set; } = string.Empty;

    public Document? Document { get; set; }
}
