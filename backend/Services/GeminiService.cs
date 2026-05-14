using System.Text.Json.Serialization;

namespace KnowledgeBaseAssistant.Api.Services;

public class GeminiService : IGeminiService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public GeminiService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> AnswerFromContextAsync(
        string question,
        string context,
        CancellationToken cancellationToken)
    {
        var apiKey = Environment.GetEnvironmentVariable("GEMINI_API_KEY")
            ?? _configuration["Gemini:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Gemini API key is missing. Set the GEMINI_API_KEY environment variable.");
        }

        var model = _configuration["Gemini:Model"] ?? "gemini-2.5-flash";
        var modelName = model.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
            ? model["models/".Length..]
            : model;
        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{Uri.EscapeDataString(modelName)}:generateContent";
        var prompt = BuildPrompt(question, context);

        var request = new GeminiRequest(
            new[]
            {
                new GeminiContent(
                    "user",
                    new[] { new GeminiPart(prompt) })
            },
            new GeminiGenerationConfig(0.2, 800));

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(request)
        };
        httpRequest.Headers.Add("x-goog-api-key", apiKey);

        using var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException(
                $"Gemini API request failed with {(int)response.StatusCode}: {error}",
                null,
                response.StatusCode);
        }

        var geminiResponse = await response.Content.ReadFromJsonAsync<GeminiResponse>(
            cancellationToken: cancellationToken);

        var answer = geminiResponse?.Candidates?
            .FirstOrDefault()?
            .Content?
            .Parts?
            .FirstOrDefault()?
            .Text;

        return string.IsNullOrWhiteSpace(answer)
            ? "I could not generate an answer from the provided context."
            : answer.Trim();
    }

    private static string BuildPrompt(string question, string context)
    {
        return """
            You are an AI Knowledge Base Assistant.
            Answer the user's question using only the provided context.
            If the context does not contain the answer, say: "I don't know based on the saved documents."
            Do not use outside knowledge.
            Keep the answer concise and helpful.

            Context:
            {{context}}

            Question:
            {{question}}
            """
            .Replace("{{context}}", string.IsNullOrWhiteSpace(context) ? "No relevant context was found." : context)
            .Replace("{{question}}", question);
    }

    private sealed record GeminiRequest(
        [property: JsonPropertyName("contents")] IReadOnlyList<GeminiContent> Contents,
        [property: JsonPropertyName("generationConfig")] GeminiGenerationConfig GenerationConfig);

    private sealed record GeminiContent(
        [property: JsonPropertyName("role")] string Role,
        [property: JsonPropertyName("parts")] IReadOnlyList<GeminiPart> Parts);

    private sealed record GeminiPart([property: JsonPropertyName("text")] string Text);

    private sealed record GeminiGenerationConfig(
        [property: JsonPropertyName("temperature")] double Temperature,
        [property: JsonPropertyName("maxOutputTokens")] int MaxOutputTokens);

    private sealed class GeminiResponse
    {
        [JsonPropertyName("candidates")]
        public List<GeminiCandidate>? Candidates { get; set; }
    }

    private sealed class GeminiCandidate
    {
        [JsonPropertyName("content")]
        public GeminiContentResponse? Content { get; set; }
    }

    private sealed class GeminiContentResponse
    {
        [JsonPropertyName("parts")]
        public List<GeminiPartResponse>? Parts { get; set; }
    }

    private sealed class GeminiPartResponse
    {
        [JsonPropertyName("text")]
        public string? Text { get; set; }
    }
}
