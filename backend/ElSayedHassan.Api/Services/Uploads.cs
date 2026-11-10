using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

namespace ElSayedHassan.Api.Services;

/// <summary>"Uploads" config section.</summary>
public class UploadOptions
{
    /// <summary>Folder for uploaded images; relative paths are under the content root. Override on the host with Uploads__Path.</summary>
    public string Path { get; set; } = "wwwroot/uploads";
    public int MaxBytes { get; set; } = 5 * 1024 * 1024;
}

public enum UploadError { None, Empty, TooLarge, NotAnImage }

/// <summary>Stores product / offer images on disk and serves them from <c>/uploads</c>.</summary>
public class UploadStore(IOptions<UploadOptions> options, IWebHostEnvironment env, TimeProvider time)
{
    public const string RequestPath = "/uploads";

    public UploadOptions Options { get; } = options.Value;
    public string Root { get; } = System.IO.Path.GetFullPath(System.IO.Path.Combine(env.ContentRootPath, options.Value.Path));

    /// <summary>
    /// Saves the image as /uploads/yyyy/MM/&lt;random&gt;.&lt;ext&gt;. The type comes from the file's first bytes
    /// (not its name or Content-Type), so a renamed .exe or .html is rejected. Returns the public path.
    /// </summary>
    public async Task<(UploadError Error, string? Url)> SaveAsync(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0) return (UploadError.Empty, null);
        if (file.Length > Options.MaxBytes) return (UploadError.TooLarge, null);

        await using var input = file.OpenReadStream();
        var head = new byte[12];
        var read = await input.ReadAtLeastAsync(head, head.Length, throwOnEndOfStream: false, ct);
        var ext = Detect(head.AsSpan(0, read));
        if (ext is null) return (UploadError.NotAnImage, null);

        var now = time.GetUtcNow();
        var folder = $"{now:yyyy}/{now:MM}";
        var name = $"{Guid.NewGuid():N}.{ext}";
        var dir = System.IO.Path.Combine(Root, now.ToString("yyyy"), now.ToString("MM"));
        Directory.CreateDirectory(dir);

        input.Position = 0;
        await using (var output = new FileStream(System.IO.Path.Combine(dir, name), FileMode.CreateNew, FileAccess.Write))
            await input.CopyToAsync(output, ct);

        return (UploadError.None, $"{RequestPath}/{folder}/{name}");
    }

    private static string? Detect(ReadOnlySpan<byte> b)
    {
        if (b.Length >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return "jpg";
        if (b.Length >= 8 && b[..8].SequenceEqual<byte>([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return "png";
        if (b.Length >= 12 && b[..4].SequenceEqual("RIFF"u8) && b[8..12].SequenceEqual("WEBP"u8)) return "webp";
        return null;
    }
}

public static class UploadSetup
{
    public static IServiceCollection AddUploads(this IServiceCollection services, IConfiguration config)
    {
        services.Configure<UploadOptions>(config.GetSection("Uploads"));
        services.AddSingleton<UploadStore>();
        return services;
    }

    /// <summary>Serves the uploads folder at /uploads (images only, long cache: file names are random and never reused).</summary>
    public static WebApplication UseUploads(this WebApplication app)
    {
        var store = app.Services.GetRequiredService<UploadStore>();
        Directory.CreateDirectory(store.Root);
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(store.Root),
            RequestPath = UploadStore.RequestPath,
            OnPrepareResponse = ctx =>
            {
                ctx.Context.Response.Headers.CacheControl = "public, max-age=31536000, immutable";
                ctx.Context.Response.Headers.XContentTypeOptions = "nosniff";
            },
        });
        return app;
    }
}
