using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ElSayedHassan.Api.Services;

/// <summary>"Jwt" config section. Key comes from user-secrets / env var Jwt__Key (min 32 chars), never appsettings.json.</summary>
public class JwtOptions
{
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "ElSayedHassan.Api";
    public string Audience { get; set; } = "ElSayedHassan.Admin";
    public double ExpiryHours { get; set; } = 8;

    public SymmetricSecurityKey SigningKey() => new(Encoding.UTF8.GetBytes(Key));
}

public class JwtTokens(IOptions<JwtOptions> options, TimeProvider time)
{
    /// <summary>Short "role" claim (Owner / Staff), easy to read from the token in Angular.</summary>
    public const string RoleClaim = "role";

    private readonly JwtOptions o = options.Value;

    public (string Token, DateTime ExpiresAt) Create(AdminUser user)
    {
        var now = time.GetUtcNow().UtcDateTime;
        var expires = now.AddHours(o.ExpiryHours);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName),
            new Claim(JwtRegisteredClaimNames.Name, user.DisplayName),
            new Claim(RoleClaim, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
        };
        var token = new JwtSecurityToken(o.Issuer, o.Audience, claims, now, expires,
            new SigningCredentials(o.SigningKey(), SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}

public static class JwtSetup
{
    /// <summary>Registers JwtOptions, JwtTokens and JWT bearer auth. Fails fast if Jwt:Key is missing or short.</summary>
    public static IServiceCollection AddAppJwt(this IServiceCollection services, IConfiguration config)
    {
        var o = config.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
        if (o.Key.Length < 32)
            throw new InvalidOperationException("Jwt:Key is missing or shorter than 32 characters (set it with user-secrets / env var Jwt__Key).");

        services.Configure<JwtOptions>(config.GetSection("Jwt"));
        services.AddSingleton<JwtTokens>();
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(b =>
            {
                b.MapInboundClaims = false;   // keep "sub", "role", ... as-is
                b.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = o.Issuer,
                    ValidAudience = o.Audience,
                    IssuerSigningKey = o.SigningKey(),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    NameClaimType = JwtRegisteredClaimNames.UniqueName,
                    RoleClaimType = JwtTokens.RoleClaim,
                };
            });
        return services;
    }
}
