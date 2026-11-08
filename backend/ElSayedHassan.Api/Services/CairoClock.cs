namespace ElSayedHassan.Api.Services;

/// <summary>"Now" in Cairo time. The server may run in any time zone (MonsterASP is UTC/European).</summary>
public class CairoClock(TimeProvider time)
{
    private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Africa/Cairo");

    public DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(time.GetUtcNow().UtcDateTime, Zone);
    public DateOnly Today => DateOnly.FromDateTime(Now);
}
