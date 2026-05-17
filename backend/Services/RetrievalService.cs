using System.Text.RegularExpressions;
using KnowledgeBaseAssistant.Api.Data;
using KnowledgeBaseAssistant.Api.DTOs.Chat;
using KnowledgeBaseAssistant.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBaseAssistant.Api.Services;

public class RetrievalService : IRetrievalService
{
    private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
        "how", "i", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to",
        "was", "were", "what", "when", "where", "who", "why", "with", "you", "your"
    };

    private readonly AppDbContext _db;

    public RetrievalService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<ContextChunkDto>> GetTopChunksAsync(
        Guid userId,
        string question,
        int limit,
        CancellationToken cancellationToken)
    {
        var keywords = ExtractKeywords(question);
        var chunks = await _db.DocumentChunks
            .AsNoTracking()
            .Include(chunk => chunk.Document)
            .Where(chunk => chunk.Document != null && chunk.Document.UserId == userId)
            .ToListAsync(cancellationToken);

        if (chunks.Count == 0)
        {
            return Array.Empty<ContextChunkDto>();
        }

        if (keywords.Count == 0)
        {
            return GetFallbackChunks(chunks, limit);
        }

        var scoredChunks = chunks
            .Select(chunk =>
            {
                var score = ScoreChunk(chunk.Content, keywords)
                    + ScoreChunk(chunk.Document?.Title ?? string.Empty, keywords) * 3;

                return new ContextChunkDto
                {
                    DocumentId = chunk.DocumentId,
                    DocumentTitle = chunk.Document?.Title ?? string.Empty,
                    ChunkIndex = chunk.ChunkIndex,
                    Content = chunk.Content,
                    Score = score
                };
            })
            .Where(chunk => chunk.Score > 0)
            .OrderByDescending(chunk => chunk.Score)
            .ThenBy(chunk => chunk.DocumentTitle)
            .ThenBy(chunk => chunk.ChunkIndex)
            .Take(limit)
            .ToList();

        return scoredChunks.Count > 0
            ? scoredChunks
            : GetFallbackChunks(chunks, limit);
    }

    private static IReadOnlyList<string> ExtractKeywords(string question)
    {
        return Regex.Matches(question.ToLowerInvariant(), @"[a-z0-9]+")
            .Select(match => match.Value)
            .Where(word => word.Length >= 3 && !StopWords.Contains(word))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static int ScoreChunk(string content, IReadOnlyList<string> keywords)
    {
        var normalizedContent = content.ToLowerInvariant();
        var score = 0;

        foreach (var keyword in keywords)
        {
            score += Regex.Matches(normalizedContent, $@"\b{Regex.Escape(keyword)}\b").Count;
        }

        return score;
    }

    private static IReadOnlyList<ContextChunkDto> GetFallbackChunks(
        IReadOnlyList<DocumentChunk> chunks,
        int limit)
    {
        return chunks
            .OrderByDescending(chunk => chunk.Document?.CreatedAtUtc)
            .ThenBy(chunk => chunk.ChunkIndex)
            .Take(limit)
            .Select(chunk => new ContextChunkDto
            {
                DocumentId = chunk.DocumentId,
                DocumentTitle = chunk.Document?.Title ?? string.Empty,
                ChunkIndex = chunk.ChunkIndex,
                Content = chunk.Content,
                Score = 0
            })
            .ToList();
    }
}
