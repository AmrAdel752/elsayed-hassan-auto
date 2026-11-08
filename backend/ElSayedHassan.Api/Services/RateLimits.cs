using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;

namespace ElSayedHassan.Api.Services;

public static class RateLimits
{
    public const string Bookings = "bookings";
    public const string Login = "login";

    /// <summary>
    /// Per-IP fixed window on POST /api/bookings. Defaults: 5 requests / 10 minutes.
    /// Override with RateLimit:Bookings:PermitLimit and RateLimit:Bookings:WindowMinutes.
    /// </summary>
    public static IServiceCollection AddAppRateLimits(this IServiceCollection services, IConfiguration config)
    {
        var permit = config.GetValue("RateLimit:Bookings:PermitLimit", 5);
        var window = TimeSpan.FromMinutes(config.GetValue("RateLimit:Bookings:WindowMinutes", 10.0));

        services.AddRateLimiter(o =>
        {
            o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            o.AddPolicy(Bookings, ctx => RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions { PermitLimit = permit, Window = window, QueueLimit = 0 }));

            // brute-force guard on the dashboard login: 10 tries / 15 minutes per IP
            o.AddPolicy(Login, ctx => RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = config.GetValue("RateLimit:Login:PermitLimit", 10),
                    Window = TimeSpan.FromMinutes(config.GetValue("RateLimit:Login:WindowMinutes", 15.0)),
                    QueueLimit = 0,
                }));

            o.OnRejected = async (ctx, ct) =>
            {
                if (ctx.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry))
                    ctx.HttpContext.Response.Headers.RetryAfter = ((int)retry.TotalSeconds).ToString();

                var problems = ctx.HttpContext.RequestServices.GetRequiredService<IProblemDetailsService>();
                await problems.WriteAsync(new ProblemDetailsContext
                {
                    HttpContext = ctx.HttpContext,
                    ProblemDetails = new ProblemDetails
                    {
                        Status = StatusCodes.Status429TooManyRequests,
                        Title = "rate_limited",
                        Detail = "Too many attempts. Please try again later.",
                    },
                });
            };
        });
        return services;
    }
}
