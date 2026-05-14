using System.Security.Claims;

namespace KnowledgeBaseAssistant.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetRequiredUserId(this ClaimsPrincipal user)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            throw new UnauthorizedAccessException("The access token does not contain a valid user id.");
        }

        return parsedUserId;
    }
}
