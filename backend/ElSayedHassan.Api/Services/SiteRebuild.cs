namespace ElSayedHassan.Api.Services;

/// <summary>
/// The public website (Cloudflare Pages) bundles a copy of the catalog, offers, reviews and gallery at build
/// time, so its pages show them instantly. After the dashboard changes any of them, this asks Cloudflare to
/// rebuild the site through a Pages deploy hook (config <c>Cloudflare:DeployHookUrl</c>, an env var in production;
/// it's a secret URL, never committed). Changes are grouped: the hook is called once things have been quiet
/// for <c>Cloudflare:RebuildDelaySeconds</c> (default 45), so editing ten products starts one build, not ten.
/// No URL configured (e.g. local dev) = nothing is called.
/// </summary>
public sealed class SiteRebuild(IConfiguration config, IHttpClientFactory http, TimeProvider time, ILogger<SiteRebuild> log)
    : BackgroundService
{
    private readonly string? hookUrl = config["Cloudflare:DeployHookUrl"];
    private readonly TimeSpan delay = TimeSpan.FromSeconds(config.GetValue("Cloudflare:RebuildDelaySeconds", 45));
    private readonly Lock gate = new();
    private DateTimeOffset? lastChange;

    /// <summary>Content shown on the website changed: rebuild the site soon.</summary>
    public void Request()
    {
        lock (gate) lastChange = time.GetUtcNow();
    }

    protected override async Task ExecuteAsync(CancellationToken stop)
    {
        if (string.IsNullOrWhiteSpace(hookUrl))
        {
            log.LogInformation("Cloudflare:DeployHookUrl is not set: the website won't be rebuilt after dashboard changes.");
            return;
        }
        using var tick = new PeriodicTimer(TimeSpan.FromSeconds(5), time);
        while (await tick.WaitForNextTickAsync(stop))
        {
            lock (gate)
            {
                if (lastChange is not { } at || time.GetUtcNow() - at < delay) continue;
                lastChange = null;
            }
            await CallHookAsync(stop);
        }
    }

    private async Task CallHookAsync(CancellationToken stop)
    {
        for (var attempt = 1; attempt <= 3; attempt++)
        {
            try
            {
                using var res = await http.CreateClient().PostAsync(hookUrl, null, stop);
                if (res.IsSuccessStatusCode) { log.LogInformation("Website rebuild started (Cloudflare deploy hook)."); return; }
                log.LogWarning("Cloudflare deploy hook answered {Status} (attempt {Attempt}).", (int)res.StatusCode, attempt);
            }
            catch (Exception e) when (e is HttpRequestException or TaskCanceledException && !stop.IsCancellationRequested)
            {
                log.LogWarning(e, "Cloudflare deploy hook failed (attempt {Attempt}).", attempt);
            }
            await Task.Delay(TimeSpan.FromSeconds(10 * attempt), time, stop);
        }
    }
}

public static class SiteRebuildExtensions
{
    /// <summary>Dashboard sections whose content is bundled into the website.</summary>
    private static readonly string[] SitePaths =
        ["/api/admin/categories", "/api/admin/products", "/api/admin/offers", "/api/admin/reviews", "/api/admin/gallery", "/api/admin/before-after"];

    public static IServiceCollection AddSiteRebuild(this IServiceCollection services)
    {
        services.AddHttpClient();
        services.AddSingleton<SiteRebuild>();
        services.AddHostedService(sp => sp.GetRequiredService<SiteRebuild>());
        return services;
    }

    /// <summary>After a successful add / edit / delete in one of those sections, schedule a website rebuild.</summary>
    public static IApplicationBuilder UseSiteRebuild(this IApplicationBuilder app) => app.Use(async (ctx, next) =>
    {
        await next();
        var req = ctx.Request;
        if (HttpMethods.IsGet(req.Method) || HttpMethods.IsHead(req.Method) || HttpMethods.IsOptions(req.Method)) return;
        if (ctx.Response.StatusCode is < 200 or >= 300) return;
        if (SitePaths.Any(p => req.Path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase)))
            ctx.RequestServices.GetRequiredService<SiteRebuild>().Request();
    });
}
