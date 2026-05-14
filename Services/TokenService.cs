using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KnowledgeBaseAssistant.Api.DTOs.Auth;
using KnowledgeBaseAssistant.Api.Entities;
using Microsoft.IdentityModel.Tokens;

namespace KnowledgeBaseAssistant.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public AuthResponseDto CreateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is missing.");
        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is missing.");
        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is missing.");

        var expiresAtUtc = DateTime.UtcNow.AddHours(2);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAtUtc,
            Email = user.Email
        };
    }
}
