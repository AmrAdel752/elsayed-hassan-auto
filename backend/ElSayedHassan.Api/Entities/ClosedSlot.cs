namespace ElSayedHassan.Api.Entities;

/// <summary>One hour closed for bookings on a given day.</summary>
public class ClosedSlot : BaseEntity
{
    public DateOnly Date { get; set; }
    public int Hour { get; set; }
    public string? Reason { get; set; }
}
