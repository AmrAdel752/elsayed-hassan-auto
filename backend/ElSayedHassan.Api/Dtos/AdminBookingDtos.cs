using System.ComponentModel.DataAnnotations;
using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Dtos;

/// <summary>A page of results.</summary>
public record PagedDto<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

public record AdminBookingDto(
    int Id, string Code, string Name, string Phone, string Model, string? Generation, int? Year, string? Km,
    IReadOnlyList<string> Services, DateOnly Date, int Hour, string? Notes, string Status, string? AdminNote,
    DateTime CreatedAt, DateTime? UpdatedAt)
{
    public static AdminBookingDto From(Booking b) => new(
        b.Id, b.Code, b.Name, b.Phone, b.Model, b.Generation, b.Year, b.Km, b.Services, b.Date, b.Hour,
        b.Notes, b.Status.ToString(), b.AdminNote, b.CreatedAt, b.UpdatedAt);
}

public record BookingQuery
{
    /// <summary>Exact day (yyyy-MM-dd). Overrides from/to.</summary>
    public DateOnly? Date { get; init; }
    public DateOnly? From { get; init; }
    public DateOnly? To { get; init; }
    /// <summary>New, Confirmed, Done, Cancelled or NoShow.</summary>
    public BookingStatus? Status { get; init; }
    /// <summary>Search in code, name and phone.</summary>
    [StringLength(100)] public string? Q { get; init; }
    /// <summary>"date" (default: soonest first) or "newest" (latest created first).</summary>
    public string? Sort { get; init; }
    [Range(1, 100000)] public int Page { get; init; } = 1;
    [Range(1, 100)] public int PageSize { get; init; } = 20;
}

/// <summary>Send only what changes. An empty <c>AdminNote</c> clears the note.</summary>
public record UpdateBookingDto
{
    public BookingStatus? Status { get; init; }
    [StringLength(1000)] public string? AdminNote { get; init; }
}

public record DashboardDto(
    DateOnly Today,
    DayCountsDto TodayCounts,
    /// <summary>Not-yet-confirmed bookings from today onwards.</summary>
    int NewCount,
    /// <summary>Active (New/Confirmed) bookings in the next 7 days, today included.</summary>
    int UpcomingCount,
    IReadOnlyList<AdminBookingDto> Next);

public record DayCountsDto(int Total, int New, int Confirmed, int Done, int Cancelled, int NoShow);
