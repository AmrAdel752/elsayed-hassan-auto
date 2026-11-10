namespace ElSayedHassan.Api.Entities;

public enum BookingStatus
{
    New,        // just booked from the website (not confirmed by the shop yet)
    Confirmed,
    Done,
    Cancelled,
    NoShow,
}

/// <summary>A customer booking for one hour slot (max N cars per slot, see slot settings).</summary>
public class Booking : BaseEntity
{
    /// <summary>Public reference sent in WhatsApp, e.g. SHA-48213.</summary>
    public string Code { get; set; } = "";

    public string Name { get; set; } = "";
    public string Phone { get; set; } = "";

    /// <summary>Model slug/name as chosen on the site, e.g. "sunny".</summary>
    public string Model { get; set; } = "";
    /// <summary>Optional generation, e.g. "N17".</summary>
    public string? Generation { get; set; }
    /// <summary>Model year (optional: the home quick form doesn't ask for it).</summary>
    public int? Year { get; set; }
    /// <summary>Odometer as typed by the customer (free text, optional).</summary>
    public string? Km { get; set; }

    /// <summary>Service slugs (stored as a JSON array column).</summary>
    public List<string> Services { get; set; } = [];

    /// <summary>Local (Cairo) date of the visit.</summary>
    public DateOnly Date { get; set; }
    /// <summary>Start hour of the slot, 0–23 (Cairo time).</summary>
    public int Hour { get; set; }

    public string? Notes { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.New;

    /// <summary>Internal note written by the shop (never shown to the customer).</summary>
    public string? AdminNote { get; set; }
    /// <summary>Last change from the dashboard (UTC).</summary>
    public DateTime? UpdatedAt { get; set; }
}
