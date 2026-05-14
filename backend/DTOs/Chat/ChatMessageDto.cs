namespace KnowledgeBaseAssistant.Api.DTOs.Chat;

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}
