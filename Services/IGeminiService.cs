namespace KnowledgeBaseAssistant.Api.Services;

public interface IGeminiService
{
    Task<string> AnswerFromContextAsync(
        string question,
        string context,
        CancellationToken cancellationToken);
}
