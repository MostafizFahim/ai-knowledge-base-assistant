using KnowledgeBaseAssistant.Api.Entities;
using KnowledgeBaseAssistant.Api.DTOs.Auth;

namespace KnowledgeBaseAssistant.Api.Services;

public interface ITokenService
{
    AuthResponseDto CreateToken(User user);
}
