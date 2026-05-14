namespace KnowledgeBaseAssistant.Api.Entities;

public class Document
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<DocumentChunk> Chunks { get; set; } = new List<DocumentChunk>();
}
