namespace ElSayedHassan.Api.Entities;

/// <summary>Customer review shown on the home page and /reviews. Added and managed from the dashboard.</summary>
public class Review : BaseEntity
{
    /// <summary>Customer name.</summary>
    public Tr Name { get; set; } = new();
    /// <summary>Nissan model, e.g. "Sunny" (optional).</summary>
    public string? Model { get; set; }
    public int? Year { get; set; }
    /// <summary>Service slug the review is about, e.g. "ac" (optional).</summary>
    public string? Service { get; set; }
    /// <summary>1–5 stars.</summary>
    public int Rating { get; set; } = 5;
    /// <summary>Date shown on the review.</summary>
    public DateOnly Date { get; set; }
    public Tr Text { get; set; } = new();

    /// <summary>Hidden from the website when false (kept in the dashboard).</summary>
    public bool IsVisible { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
}
