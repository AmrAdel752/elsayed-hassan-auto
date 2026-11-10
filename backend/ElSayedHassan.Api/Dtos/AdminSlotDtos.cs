using System.ComponentModel.DataAnnotations;

namespace ElSayedHassan.Api.Dtos;

public record SlotSettingsDto : IValidatableObject
{
    /// <summary>Max cars per hour.</summary>
    [Range(1, 50)] public int Capacity { get; init; }
    /// <summary>First bookable hour (0–23).</summary>
    [Range(0, 23)] public int OpenHour { get; init; }
    /// <summary>Closing hour (1–24); the last slot starts at CloseHour - 1.</summary>
    [Range(1, 24)] public int CloseHour { get; init; }
    /// <summary>How many days ahead customers can book.</summary>
    [Range(1, 90)] public int MaxDaysAhead { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext _)
    {
        if (OpenHour >= CloseHour)
            yield return new ValidationResult("OpenHour must be before CloseHour.", [nameof(OpenHour), nameof(CloseHour)]);
    }
}

public record ClosedDayDto(int Id, DateOnly Date, string? Reason);
public record ClosedSlotDto(int Id, DateOnly Date, int Hour, string? Reason);

/// <summary>Settings + everything closed from today onwards.</summary>
public record SlotAdminDto(SlotSettingsDto Settings, IReadOnlyList<ClosedDayDto> ClosedDays, IReadOnlyList<ClosedSlotDto> ClosedSlots);

public record CloseDayDto
{
    [Required] public DateOnly Date { get; init; }
    [StringLength(200)] public string? Reason { get; init; }
}

public record CloseSlotDto
{
    [Required] public DateOnly Date { get; init; }
    [Range(0, 23)] public int Hour { get; init; }
    [StringLength(200)] public string? Reason { get; init; }
}

/// <summary>Returned when closing: how many active bookings already exist there (the shop should call them).</summary>
public record ClosedResultDto<T>(T Closed, int ActiveBookings);
