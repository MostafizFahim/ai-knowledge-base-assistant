using KnowledgeBaseAssistant.Api.DTOs.Documents;

namespace KnowledgeBaseAssistant.Api.Services;

public interface IDocumentService
{
    Task<DocumentListItemDto> CreateAsync(Guid userId, CreateDocumentRequestDto request, CancellationToken cancellationToken);
    Task<DocumentListItemDto> UploadAsync(Guid userId, UploadDocumentRequestDto request, CancellationToken cancellationToken);
    Task<IReadOnlyList<DocumentListItemDto>> ListAsync(Guid userId, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid userId, Guid documentId, CancellationToken cancellationToken);
}
