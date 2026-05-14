using System.Text.RegularExpressions;
using KnowledgeBaseAssistant.Api.Data;
using KnowledgeBaseAssistant.Api.DTOs.Documents;
using KnowledgeBaseAssistant.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBaseAssistant.Api.Services;

public class DocumentService : IDocumentService
{
    private const int ChunkWordCount = 140;
    private const int ChunkOverlapWordCount = 25;
    private readonly AppDbContext _db;

    public DocumentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DocumentListItemDto> CreateAsync(
        Guid userId,
        CreateDocumentRequestDto request,
        CancellationToken cancellationToken)
    {
        var title = request.Title.Trim();
        var content = request.Content.Trim();

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException("Document title and content are required.");
        }

        var chunks = SplitIntoChunks(content);

        var document = new Document
        {
            UserId = userId,
            Title = title,
            Content = content,
            Chunks = chunks.Select((chunk, index) => new DocumentChunk
            {
                ChunkIndex = index,
                Content = chunk
            }).ToList()
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync(cancellationToken);

        return new DocumentListItemDto
        {
            Id = document.Id,
            Title = document.Title,
            CreatedAtUtc = document.CreatedAtUtc,
            ChunkCount = document.Chunks.Count
        };
    }

    public async Task<IReadOnlyList<DocumentListItemDto>> ListAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _db.Documents
            .AsNoTracking()
            .Where(document => document.UserId == userId)
            .OrderByDescending(document => document.CreatedAtUtc)
            .Select(document => new DocumentListItemDto
            {
                Id = document.Id,
                Title = document.Title,
                CreatedAtUtc = document.CreatedAtUtc,
                ChunkCount = document.Chunks.Count
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid documentId, CancellationToken cancellationToken)
    {
        var document = await _db.Documents.FirstOrDefaultAsync(
            existingDocument => existingDocument.Id == documentId && existingDocument.UserId == userId,
            cancellationToken);

        if (document is null)
        {
            return false;
        }

        _db.Documents.Remove(document);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static IReadOnlyList<string> SplitIntoChunks(string text)
    {
        var words = Regex.Matches(text, @"\S+")
            .Select(match => match.Value)
            .ToList();

        if (words.Count == 0)
        {
            return Array.Empty<string>();
        }

        var chunks = new List<string>();
        var step = Math.Max(1, ChunkWordCount - ChunkOverlapWordCount);

        for (var start = 0; start < words.Count; start += step)
        {
            var chunkWords = words.Skip(start).Take(ChunkWordCount).ToList();
            if (chunkWords.Count == 0)
            {
                break;
            }

            chunks.Add(string.Join(' ', chunkWords));

            if (start + ChunkWordCount >= words.Count)
            {
                break;
            }
        }

        return chunks;
    }
}
