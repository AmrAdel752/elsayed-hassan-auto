using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    AppDbContext db, IPasswordHasher<AdminUser> hasher, JwtTokens tokens, TimeProvider time, ILogger<AuthController> log) : ControllerBase
{
    /// <summary>Hash of a random password: used when the user doesn't exist so the response time doesn't reveal it.</summary>
    private static readonly Lazy<string> DummyHash =
        new(() => new PasswordHasher<AdminUser>().HashPassword(new AdminUser(), Guid.NewGuid().ToString()));

    /// <summary>Dashboard login. 200 = JWT (8h), 401 = wrong user name / password or disabled account.</summary>
    [HttpPost("login")]
    [EnableRateLimiting(RateLimits.Login)]
    [ProducesResponseType<LoginResultDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login(LoginDto dto, CancellationToken ct)
    {
        var userName = dto.UserName.Trim().ToLowerInvariant();
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.UserName == userName, ct);

        PasswordVerificationResult result;
        if (user is null)
        {
            hasher.VerifyHashedPassword(new AdminUser(), DummyHash.Value, dto.Password);   // same cost as a real check
            result = PasswordVerificationResult.Failed;
        }
        else result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);

        if (user is null || !user.IsActive || result == PasswordVerificationResult.Failed)
        {
            log.LogWarning("Failed login for '{User}' from {Ip}", userName, HttpContext.Connection.RemoteIpAddress);
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "invalid_credentials",
                detail: "Wrong user name or password.");
        }

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
            user.PasswordHash = hasher.HashPassword(user, dto.Password);
        user.LastLoginAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);

        var (token, expiresAt) = tokens.Create(user);
        log.LogInformation("Admin '{User}' logged in", user.UserName);
        return Ok(new LoginResultDto(token, expiresAt,
            new AdminUserDto(user.Id, user.UserName, user.DisplayName, user.Role.ToString())));
    }
}
