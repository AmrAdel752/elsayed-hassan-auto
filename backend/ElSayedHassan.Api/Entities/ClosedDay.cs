namespace ElSayedHassan.Api.Entities;

/// <summary>A whole day closed for bookings (holiday, Eid, ...).</summary>
public class ClosedDay : BaseEntity
{
    public DateOnly Date { get; set; }
    public string? Reason { get; set; }
}
