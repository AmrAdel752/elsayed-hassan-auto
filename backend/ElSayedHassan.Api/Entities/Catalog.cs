namespace ElSayedHassan.Api.Entities;

/// <summary>Product category (oils, filters, ...). <c>Slug</c> is the frontend's category <c>id</c>.</summary>
public class Category : BaseEntity
{
    public string Slug { get; set; } = "";
    /// <summary>Icon name from the frontend icon set.</summary>
    public string Icon { get; set; } = "";
    public Tr Name { get; set; } = new();
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public List<Product> Products { get; set; } = [];
}

/// <summary>Spare part / product shown on /products.</summary>
public class Product : BaseEntity
{
    public string Slug { get; set; } = "";
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string Icon { get; set; } = "";
    public string Brand { get; set; } = "";
    public Tr Name { get; set; } = new();
    public Tr Desc { get; set; } = new();

    /// <summary>EGP.</summary>
    public decimal Price { get; set; }
    /// <summary>Price before discount (optional, shown struck through).</summary>
    public decimal? OldPrice { get; set; }
    /// <summary>What the center pays for it. Internal: never sent to the public site.</summary>
    public decimal? Cost { get; set; }

    /// <summary>Nissan models it fits (JSON array), e.g. ["Sunny","Sentra"].</summary>
    public List<string> Models { get; set; } = [];
    public bool InStock { get; set; } = true;
    public bool Featured { get; set; }

    /// <summary>Optional badge ("Best seller"); both null = no badge.</summary>
    public string? BadgeAr { get; set; }
    public string? BadgeEn { get; set; }

    /// <summary>Uploaded image path (/uploads/...) or absolute URL; null = show the icon.</summary>
    public string? ImageUrl { get; set; }

    public int SortOrder { get; set; }
    /// <summary>Hidden from the website when false (kept in the dashboard).</summary>
    public bool IsActive { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
}

/// <summary>Time-limited offer shown on /offers. <c>Slug</c> is the frontend's offer <c>id</c>.</summary>
public class Offer : BaseEntity
{
    public string Slug { get; set; } = "";
    public string Icon { get; set; } = "";
    public Tr Title { get; set; } = new();
    public Tr Desc { get; set; } = new();
    /// <summary>Discount label, e.g. "Save 18%".</summary>
    public Tr Discount { get; set; } = new();

    public decimal? Price { get; set; }
    public decimal? OldPrice { get; set; }
    /// <summary>What the center pays for it. Internal: never sent to the public site.</summary>
    public decimal? Cost { get; set; }

    /// <summary>The offer disappears from the website after this moment.</summary>
    public DateTimeOffset EndsAt { get; set; }
    /// <summary>Service slug to preselect when the customer books this offer (optional).</summary>
    public string? Service { get; set; }

    /// <summary>What's included (JSON array of {Ar, En}).</summary>
    public List<Tr> Includes { get; set; } = [];

    public string? ImageUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? UpdatedAt { get; set; }
}
