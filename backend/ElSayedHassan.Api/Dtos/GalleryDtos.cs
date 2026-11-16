using System.ComponentModel.DataAnnotations;
using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Dtos;

// ---------- public (same shapes as frontend/src/app/data/gallery.ts) ----------

public record GalleryItemDto(int Id, string Cat, string Icon, bool Tall, TrDto Title, string? Img);
public record BeforeAfterDto(int Id, string Icon, TrDto Title, TrDto Desc, string? Before, string? After);
public record GalleryDto(IReadOnlyList<GalleryItemDto> Items, IReadOnlyList<BeforeAfterDto> BeforeAfter);

// ---------- admin ----------

public record AdminGalleryItemDto(int Id, string Cat, string Icon, bool Tall, TrDto Title, string? Img, int SortOrder, bool IsVisible);
public record AdminBeforeAfterDto(int Id, string Icon, TrDto Title, TrDto Desc, string? Before, string? After, int SortOrder, bool IsVisible);

/// <summary>Arabic is required; English is optional (falls back to the Arabic text).</summary>
public record SaveGalleryItemDto
{
    [Required, RegularExpression("^(workshop|work|cars)$")] public string Cat { get; init; } = "work";
    [Required, StringLength(40)] public string Icon { get; init; } = "car";
    public bool Tall { get; init; }
    [Required, StringLength(200, MinimumLength = 2)] public string TitleAr { get; init; } = "";
    [StringLength(200)] public string? TitleEn { get; init; }
    [StringLength(300), RegularExpression(CatalogRules.Image)] public string? Img { get; init; }
    [Range(0, 10000)] public int SortOrder { get; init; }
    public bool IsVisible { get; init; } = true;
}

public record SaveBeforeAfterDto
{
    [Required, StringLength(40)] public string Icon { get; init; } = "car";
    [Required, StringLength(200, MinimumLength = 2)] public string TitleAr { get; init; } = "";
    [StringLength(200)] public string? TitleEn { get; init; }
    [Required, StringLength(1000, MinimumLength = 2)] public string DescAr { get; init; } = "";
    [StringLength(1000)] public string? DescEn { get; init; }
    [StringLength(300), RegularExpression(CatalogRules.Image)] public string? Before { get; init; }
    [StringLength(300), RegularExpression(CatalogRules.Image)] public string? After { get; init; }
    [Range(0, 10000)] public int SortOrder { get; init; }
    public bool IsVisible { get; init; } = true;
}

public static class GalleryMap
{
    private static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
    private static Tr Text(string ar, string? en) => new(ar.Trim(), Clean(en) ?? ar.Trim());

    public static GalleryItemDto ToDto(this GalleryItem g) => new(g.Id, g.Category, g.Icon, g.Tall, TrDto.From(g.Title), g.ImageUrl);
    public static BeforeAfterDto ToDto(this BeforeAfter b) => new(b.Id, b.Icon, TrDto.From(b.Title), TrDto.From(b.Desc), b.BeforeUrl, b.AfterUrl);

    public static AdminGalleryItemDto ToAdminDto(this GalleryItem g) =>
        new(g.Id, g.Category, g.Icon, g.Tall, TrDto.From(g.Title), g.ImageUrl, g.SortOrder, g.IsVisible);
    public static AdminBeforeAfterDto ToAdminDto(this BeforeAfter b) =>
        new(b.Id, b.Icon, TrDto.From(b.Title), TrDto.From(b.Desc), b.BeforeUrl, b.AfterUrl, b.SortOrder, b.IsVisible);

    public static void Apply(this SaveGalleryItemDto d, GalleryItem g)
    {
        g.Category = d.Cat; g.Icon = d.Icon.Trim(); g.Tall = d.Tall; g.Title = Text(d.TitleAr, d.TitleEn);
        g.ImageUrl = Clean(d.Img); g.SortOrder = d.SortOrder; g.IsVisible = d.IsVisible;
    }

    public static void Apply(this SaveBeforeAfterDto d, BeforeAfter b)
    {
        b.Icon = d.Icon.Trim(); b.Title = Text(d.TitleAr, d.TitleEn); b.Desc = Text(d.DescAr, d.DescEn);
        b.BeforeUrl = Clean(d.Before); b.AfterUrl = Clean(d.After); b.SortOrder = d.SortOrder; b.IsVisible = d.IsVisible;
    }
}
