using System.Text;
using KnowledgeBaseAssistant.Api.Data;
using KnowledgeBaseAssistant.Api.DTOs.Chat;
using KnowledgeBaseAssistant.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBaseAssistant.Api.Services;

public class ChatService : IChatService
{
    private const int ContextChunkLimit = 5;
    private readonly AppDbContext _db;
    private readonly IRetrievalService _retrievalService;
    private readonly IGeminiService _geminiService;

    public ChatService(AppDbContext db, IRetrievalService retrievalService, IGeminiService geminiService)
    {
        _db = db;
        _retrievalService = retrievalService;
        _geminiService = geminiService;
    }

    public async Task<AskQuestionResponseDto> AskAsync(
        Guid userId,
        AskQuestionRequestDto request,
        CancellationToken cancellationToken)
    {
        var question = request.Question.Trim();
        var contextChunks = await _retrievalService.GetTopChunksAsync(
            userId,
            question,
            ContextChunkLimit,
            cancellationToken);

        var context = BuildContext(contextChunks);
        var answer = await _geminiService.AnswerFromContextAsync(question, context, cancellationToken);

        _db.ChatMessages.Add(new ChatMessage
        {
            UserId = userId,
            Question = question,
            Answer = answer
        });
        await _db.SaveChangesAsync(cancellationToken);

        return new AskQuestionResponseDto
        {
            Answer = answer,
            ContextUsed = contextChunks
        };
    }

    public async Task<IReadOnlyList<ChatMessageDto>> GetHistoryAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _db.ChatMessages
            .AsNoTracking()
            .Where(message => message.UserId == userId)
            .OrderByDescending(message => message.CreatedAtUtc)
            .Select(message => new ChatMessageDto
            {
                Id = message.Id,
                Question = message.Question,
                Answer = message.Answer,
                CreatedAtUtc = message.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    private static string BuildContext(IReadOnlyList<ContextChunkDto> contextChunks)
    {
        if (contextChunks.Count == 0)
        {
            return string.Empty;
        }

        var builder = new StringBuilder();
        foreach (var chunk in contextChunks)
        {
            builder.AppendLine($"Document: {chunk.DocumentTitle}");
            builder.AppendLine($"Chunk: {chunk.ChunkIndex}");
            builder.AppendLine(chunk.Content);
            builder.AppendLine();
        }

        return builder.ToString();
    }
}
