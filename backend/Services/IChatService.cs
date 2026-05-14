using KnowledgeBaseAssistant.Api.DTOs.Chat;

namespace KnowledgeBaseAssistant.Api.Services;

public interface IChatService
{
    Task<AskQuestionResponseDto> AskAsync(Guid userId, AskQuestionRequestDto request, CancellationToken cancellationToken);
    Task<IReadOnlyList<ChatMessageDto>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken);
}
