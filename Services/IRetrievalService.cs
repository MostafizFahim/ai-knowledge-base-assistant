using KnowledgeBaseAssistant.Api.DTOs.Chat;

namespace KnowledgeBaseAssistant.Api.Services;

public interface IRetrievalService
{
    Task<IReadOnlyList<ContextChunkDto>> GetTopChunksAsync(
        Guid userId,
        string question,
        int limit,
        CancellationToken cancellationToken);
}
