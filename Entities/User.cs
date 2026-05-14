namespace KnowledgeBaseAssistant.Api.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}
