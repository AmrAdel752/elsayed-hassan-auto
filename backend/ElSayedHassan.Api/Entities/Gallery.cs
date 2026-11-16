namespace ElSayedHassan.Api.Entities;

/// <summary>One tile on /gallery. Without an image the website shows the icon placeholder.</summary>
public class GalleryItem : BaseEntity
{
    /// <summary>Filter tab: workshop, work or cars.</summary>
    public string Category { get; set; } = "work";
    public string Icon { get; set; } = "car";
    /// <summary>Taller tile in the masonry grid.</summary>
    public bool Tall { get; set; }
    public Tr Title { get; set; } = new();
    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>A before / after pair on /gallery (drag slider).</summary>
public class BeforeAfter : BaseEntity
{
    public string Icon { get; set; } = "car";
    public Tr Title { get; set; } = new();
    public Tr Desc { get; set; } = new();
    public string? BeforeUrl { get; set; }
    public string? AfterUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsVisible { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
}
