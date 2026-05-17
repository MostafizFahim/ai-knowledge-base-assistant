using System.Text.RegularExpressions;

namespace KnowledgeBaseAssistant.Api.Services;

public static class TextContentNormalizer
{
    public static string NormalizeExtractedText(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text
            .Replace('\u00a0', ' ')
            .Replace("•", " • ")
            .Replace("·", " • ")
            .Replace("|", " | ");

        normalized = Regex.Replace(normalized, @"(?<=[a-z])(?=[A-Z])", " ");
        normalized = Regex.Replace(normalized, @"(?<=[A-Za-z])(?=\d)", " ");
        normalized = Regex.Replace(normalized, @"(?<=\d)(?=[A-Za-z])", " ");

        foreach (var replacement in CommonCvPhraseReplacements)
        {
            normalized = Regex.Replace(
                normalized,
                replacement.Pattern,
                replacement.Replacement,
                RegexOptions.IgnoreCase);
        }

        normalized = Regex.Replace(normalized, @"[ \t]{2,}", " ");
        normalized = Regex.Replace(normalized, @"(?:\r?\n\s*){3,}", Environment.NewLine + Environment.NewLine);

        return normalized.Trim();
    }

    private static readonly IReadOnlyList<(string Pattern, string Replacement)> CommonCvPhraseReplacements =
        new List<(string Pattern, string Replacement)>
        {
            (@"full-stacksoftwareengineer", "full-stack software engineer"),
            (@"softwareengineer", "software engineer"),
            (@"withexperiencein", "with experience in"),
            (@"restapis", "REST APIs"),
            (@"jwtauthentication", "JWT authentication"),
            (@"sqldatabases", "SQL databases"),
            (@"knowledgebaseassistant", "Knowledge Base Assistant"),
            (@"layerarchitecture", "layer architecture"),
            (@"promptengineering", "prompt engineering"),
            (@"assistantdevelopment", "assistant development"),
            (@"developingbackendservices", "developing backend services"),
            (@"relationaldatabases", "relational databases"),
            (@"enterprisebankingapplications", "enterprise banking applications"),
            (@"collaboratinginagileworkflows", "collaborating in Agile workflows"),
            (@"debuggingtools", "debugging tools"),
            (@"apitesting", "API testing")
        };
}
