using System.Net;
using System.Net.Mail;
using System.Threading.Channels;
using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// Emails the owner about every new website booking (in the background, so the customer never waits).
/// Off until configured (host env vars in production — the password is a secret, never committed):
/// <c>Notify__Email__To</c> (one or more addresses, comma-separated), <c>Notify__Smtp__Host</c>,
/// <c>Notify__Smtp__Port</c> (default 587), <c>Notify__Smtp__User</c>, <c>Notify__Smtp__Password</c>,
/// <c>Notify__Smtp__From</c> (default = User). Gmail: smtp.gmail.com + an "App password".
/// </summary>
public sealed class BookingNotifier(IConfiguration config, ILogger<BookingNotifier> log) : BackgroundService
{
    private readonly Channel<Booking> queue = Channel.CreateBounded<Booking>(new BoundedChannelOptions(100) { FullMode = BoundedChannelFullMode.DropOldest });
    private string? To => config["Notify:Email:To"];
    private string? Host => config["Notify:Smtp:Host"];
    private bool Enabled => !string.IsNullOrWhiteSpace(To) && !string.IsNullOrWhiteSpace(Host);

    /// <summary>A booking was just saved.</summary>
    public void NewBooking(Booking b) { if (Enabled) queue.Writer.TryWrite(b); }

    protected override async Task ExecuteAsync(CancellationToken stop)
    {
        if (!Enabled) log.LogInformation("Notify:Email:To / Notify:Smtp:Host not set: no booking emails.");
        await foreach (var b in queue.Reader.ReadAllAsync(stop))
        {
            try { await SendAsync(b, stop); }
            catch (Exception e) when (e is SmtpException or InvalidOperationException or FormatException)
            { log.LogWarning(e, "Booking email for {Code} failed.", b.Code); }
        }
    }

    private async Task SendAsync(Booking b, CancellationToken ct)
    {
        var user = config["Notify:Smtp:User"];
        using var smtp = new SmtpClient(Host, config.GetValue("Notify:Smtp:Port", 587))
        {
            EnableSsl = true,
            Credentials = string.IsNullOrEmpty(user) ? null : new NetworkCredential(user, config["Notify:Smtp:Password"]),
        };
        using var mail = new MailMessage
        {
            From = new MailAddress(config["Notify:Smtp:From"] ?? user ?? "no-reply@elsayedhassanauto.com", "السيد حسن أوتو"),
            Subject = $"حجز جديد {b.Code} — {b.Name} — {b.Date:yyyy-MM-dd} {b.Hour}:00",
            Body = string.Join('\n',
                $"حجز جديد من الموقع: {b.Code}",
                $"الاسم: {b.Name}",
                $"الموبايل: {b.Phone}",
                $"العربية: Nissan {b.Model} {b.Generation} {b.Year}".TrimEnd(),
                b.Km is null ? "" : $"العداد: {b.Km} كم",
                $"الخدمات: {string.Join("، ", b.Services)}",
                $"الميعاد: {b.Date:dddd yyyy-MM-dd} الساعة {b.Hour}:00",
                b.Notes is null ? "" : $"ملاحظات: {b.Notes}",
                "",
                "لوحة التحكم: https://elsayedhassanauto.com/admin/bookings"),
        };
        foreach (var to in To!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)) mail.To.Add(to);
        await smtp.SendMailAsync(mail, ct);
        log.LogInformation("Booking email sent for {Code}.", b.Code);
    }
}

public static class BookingNotifierExtensions
{
    public static IServiceCollection AddBookingNotifier(this IServiceCollection services)
    {
        services.AddSingleton<BookingNotifier>();
        services.AddHostedService(sp => sp.GetRequiredService<BookingNotifier>());
        return services;
    }
}
