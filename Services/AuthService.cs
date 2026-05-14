using KnowledgeBaseAssistant.Api.Data;
using KnowledgeBaseAssistant.Api.DTOs.Auth;
using KnowledgeBaseAssistant.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace KnowledgeBaseAssistant.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, IPasswordHasher passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var emailExists = await _db.Users.AnyAsync(user => user.Email == email, cancellationToken);

        if (emailExists)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var user = new User
        {
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return _tokenService.CreateToken(user);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _db.Users.FirstOrDefaultAsync(
            existingUser => existingUser.Email == email,
            cancellationToken);

        if (user is null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return _tokenService.CreateToken(user);
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
