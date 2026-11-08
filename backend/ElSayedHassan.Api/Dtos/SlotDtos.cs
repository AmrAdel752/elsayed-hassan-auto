namespace ElSayedHassan.Api.Dtos;

/// <summary>One hour slot. <c>Left</c> = places left (0 = full, closed or already past).</summary>
public record SlotHourDto(int Hour, int Left);

/// <summary>One day. <c>Closed</c> = the whole day is closed by the owner.</summary>
public record SlotDayDto(DateOnly Date, bool Closed, IReadOnlyList<SlotHourDto> Hours);
