using System.ComponentModel.DataAnnotations;
using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Dtos;

// ---------- public (same shapes as frontend/src/app/data/catalog.ts, plus `img`) ----------

public record CategoryDto(string Id, string Icon, TrDto Name);

public record ProductDto(
    string Slug, string Cat, string Icon, string Brand, TrDto Name, TrDto Desc, decimal Price, decimal? OldPrice,
    IReadOnlyList<string> Models, bool InStock, bool Featured, TrDto? Badge, string? Img);

public record OfferDto(
    string Id, string Icon, TrDto Title, TrDto Desc, TrDto Discount, decimal? Price, decimal? OldPrice,
    DateTimeOffset EndsAt, string? Service, IReadOnlyList<TrDto> Includes, string? Img);

// ---------- admin (read) ----------

public record AdminCategoryDto(int Id, string Slug, string Icon, TrDto Name, int SortOrder, bool IsActive, int ProductCount);

public record AdminProductDto(
    int Id, string Slug, int CategoryId, string Cat, string Icon, string Brand, TrDto Name, TrDto Desc, decimal Price,
    decimal? OldPrice, decimal? Cost, IReadOnlyList<string> Models, bool InStock, bool Featured, TrDto? Badge, string? Img,
    int SortOrder, bool IsActive, DateTime CreatedAt, DateTime? UpdatedAt);

public record AdminOfferDto(
    int Id, string Slug, string Icon, TrDto Title, TrDto Desc, TrDto Discount, decimal? Price, decimal? OldPrice, decimal? Cost,
    DateTimeOffset EndsAt, string? Service, IReadOnlyList<TrDto> Includes, string? Img,
    int SortOrder, bool IsActive, bool Expired, DateTime CreatedAt, DateTime? UpdatedAt);

// ---------- admin (write) ----------

/// <summary>Arabic + English text; both are required.</summary>
public record TrInput
{
    [Required, StringLength(2000, MinimumLength = 1)] public string Ar { get; init; } = "";
    [Required, StringLength(2000, MinimumLength = 1)] public string En { get; init; } = "";
    public Tr ToEntity() => new(Ar.Trim(), En.Trim());
}

public static class CatalogRules
{
    /// <summary>lower-case letters, digits and single dashes: "nissan-5w30-4l".</summary>
    public const string Slug = @"^[a-z0-9]+(-[a-z0-9]+)*$";
    /// <summary>An image uploaded through /api/admin/uploads, or an absolute https URL.</summary>
    public const string Image = @"^(/uploads/[A-Za-z0-9/_\-]+\.(jpg|png|webp)|https://\S+)$";
}

public record SaveCategoryDto
{
    [Required, StringLength(60), RegularExpression(CatalogRules.Slug)] public string Slug { get; init; } = "";
    [Required, StringLength(40)] public string Icon { get; init; } = "";
    [Required] public TrInput Name { get; init; } = new();
    [Range(0, 10000)] public int SortOrder { get; init; }
    public bool IsActive { get; init; } = true;
}

public record SaveProductDto : IValidatableObject
{
    [Required, StringLength(100), RegularExpression(CatalogRules.Slug)] public string Slug { get; init; } = "";
    [Range(1, int.MaxValue)] public int CategoryId { get; init; }
    [Required, StringLength(40)] public string Icon { get; init; } = "";
    [Required, StringLength(100)] public string Brand { get; init; } = "";
    [Required] public TrInput Name { get; init; } = new();
    [Required] public TrInput Desc { get; init; } = new();
    [Range(0, 10_000_000)] public decimal Price { get; init; }
    [Range(0, 10_000_000)] public decimal? OldPrice { get; init; }
    /// <summary>Internal cost (optional); only the dashboard sees it.</summary>
    [Range(0, 10_000_000)] public decimal? Cost { get; init; }
    [Required, MaxLength(30)] public List<string> Models { get; init; } = [];
    public bool InStock { get; init; } = true;
    public bool Featured { get; init; }
    /// <summary>Optional; send null (or leave out) for no badge.</summary>
    public TrInput? Badge { get; init; }
    [StringLength(300), RegularExpression(CatalogRules.Image)] public string? Img { get; init; }
    [Range(0, 10000)] public int SortOrder { get; init; }
    public bool IsActive { get; init; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext _)
    {
        if (OldPrice is { } old && old <= Price)
            yield return new ValidationResult("OldPrice must be higher than Price.", [nameof(OldPrice)]);
        if (Models.Any(m => string.IsNullOrWhiteSpace(m) || m.Length > 30))
            yield return new ValidationResult("Invalid model name.", [nameof(Models)]);
    }
}

public record SaveOfferDto : IValidatableObject
{
    [Required, StringLength(100), RegularExpression(CatalogRules.Slug)] public string Slug { get; init; } = "";
    [Required, StringLength(40)] public string Icon { get; init; } = "";
    [Required] public TrInput Title { get; init; } = new();
    [Required] public TrInput Desc { get; init; } = new();
    [Required] public TrInput Discount { get; init; } = new();
    [Range(0, 10_000_000)] public decimal? Price { get; init; }
    [Range(0, 10_000_000)] public decimal? OldPrice { get; init; }
    /// <summary>Internal cost (optional); only the dashboard sees it.</summary>
    [Range(0, 10_000_000)] public decimal? Cost { get; init; }
    [Required] public DateTimeOffset? EndsAt { get; init; }
    [StringLength(60), RegularExpression(CatalogRules.Slug)] public string? Service { get; init; }
    [Required, MaxLength(20)] public List<TrInput> Includes { get; init; } = [];
    [StringLength(300), RegularExpression(CatalogRules.Image)] public string? Img { get; init; }
    [Range(0, 10000)] public int SortOrder { get; init; }
    public bool IsActive { get; init; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext _)
    {
        if (Price is { } p && OldPrice is { } old && old <= p)
            yield return new ValidationResult("OldPrice must be higher than Price.", [nameof(OldPrice)]);
    }
}

// ---------- mapping ----------

public static class CatalogMap
{
    private static TrDto? Badge(Product p) =>
        string.IsNullOrEmpty(p.BadgeAr) && string.IsNullOrEmpty(p.BadgeEn) ? null : new TrDto(p.BadgeAr ?? "", p.BadgeEn ?? "");

    public static CategoryDto ToDto(this Category c) => new(c.Slug, c.Icon, TrDto.From(c.Name));

    /// <summary>Needs <c>Category</c> loaded.</summary>
    public static ProductDto ToDto(this Product p) => new(
        p.Slug, p.Category.Slug, p.Icon, p.Brand, TrDto.From(p.Name), TrDto.From(p.Desc), p.Price, p.OldPrice,
        p.Models, p.InStock, p.Featured, Badge(p), p.ImageUrl);

    public static OfferDto ToDto(this Offer o) => new(
        o.Slug, o.Icon, TrDto.From(o.Title), TrDto.From(o.Desc), TrDto.From(o.Discount), o.Price, o.OldPrice,
        o.EndsAt, o.Service, o.Includes.Select(TrDto.From).ToList(), o.ImageUrl);

    /// <summary>Needs <c>Category</c> loaded.</summary>
    public static AdminProductDto ToAdminDto(this Product p) => new(
        p.Id, p.Slug, p.CategoryId, p.Category.Slug, p.Icon, p.Brand, TrDto.From(p.Name), TrDto.From(p.Desc), p.Price,
        p.OldPrice, p.Cost, p.Models, p.InStock, p.Featured, Badge(p), p.ImageUrl, p.SortOrder, p.IsActive, p.CreatedAt, p.UpdatedAt);

    public static AdminOfferDto ToAdminDto(this Offer o, DateTimeOffset now) => new(
        o.Id, o.Slug, o.Icon, TrDto.From(o.Title), TrDto.From(o.Desc), TrDto.From(o.Discount), o.Price, o.OldPrice, o.Cost,
        o.EndsAt, o.Service, o.Includes.Select(TrDto.From).ToList(), o.ImageUrl, o.SortOrder, o.IsActive,
        o.EndsAt <= now, o.CreatedAt, o.UpdatedAt);

    public static void Apply(this SaveProductDto d, Product p)
    {
        p.Slug = d.Slug; p.CategoryId = d.CategoryId; p.Icon = d.Icon.Trim(); p.Brand = d.Brand.Trim();
        p.Name = d.Name.ToEntity(); p.Desc = d.Desc.ToEntity(); p.Price = d.Price; p.OldPrice = d.OldPrice; p.Cost = d.Cost;
        p.Models = d.Models.Select(m => m.Trim()).Distinct().ToList();
        p.InStock = d.InStock; p.Featured = d.Featured;
        p.BadgeAr = d.Badge?.Ar.Trim(); p.BadgeEn = d.Badge?.En.Trim();
        p.ImageUrl = string.IsNullOrWhiteSpace(d.Img) ? null : d.Img; p.SortOrder = d.SortOrder; p.IsActive = d.IsActive;
    }

    public static void Apply(this SaveOfferDto d, Offer o)
    {
        o.Slug = d.Slug; o.Icon = d.Icon.Trim(); o.Title = d.Title.ToEntity(); o.Desc = d.Desc.ToEntity();
        o.Discount = d.Discount.ToEntity(); o.Price = d.Price; o.OldPrice = d.OldPrice; o.Cost = d.Cost; o.EndsAt = d.EndsAt!.Value;
        o.Service = string.IsNullOrWhiteSpace(d.Service) ? null : d.Service;
        o.Includes = d.Includes.Select(t => t.ToEntity()).ToList();
        o.ImageUrl = string.IsNullOrWhiteSpace(d.Img) ? null : d.Img; o.SortOrder = d.SortOrder; o.IsActive = d.IsActive;
    }
}
