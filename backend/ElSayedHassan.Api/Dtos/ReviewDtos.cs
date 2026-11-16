using System.ComponentModel.DataAnnotations;
using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Dtos;

/// <summary>Public shape, same as frontend/src/app/data/reviews.ts.</summary>
public record ReviewDto(int Id, TrDto Name, string? Model, int? Year, string? Service, int Rating, DateOnly Date, TrDto Text);

public record AdminReviewDto(
    int Id, TrDto Name, string? Model, int? Year, string? Service, int Rating, DateOnly Date, TrDto Text,
    bool IsVisible, DateTime CreatedAt, DateTime? UpdatedAt);

/// <summary>Arabic is required; English is optional (the Arabic text is shown to English visitors when it's empty).</summary>
public record SaveReviewDto
{
    [Required, StringLength(100, MinimumLength = 2)] public string NameAr { get; init; } = "";
    [StringLength(100)] public string? NameEn { get; init; }
    [Required, StringLength(2000, MinimumLength = 3)] public string TextAr { get; init; } = "";
    [StringLength(2000)] public string? TextEn { get; init; }

    [StringLength(50), RegularExpression(@"^[A-Za-z0-9\- ]*$")] public string? Model { get; init; }
    [Range(1980, 2100)] public int? Year { get; init; }
    [StringLength(60), RegularExpression(@"^([a-z0-9]+(-[a-z0-9]+)*)?$")] public string? Service { get; init; }
    [Range(1, 5)] public int Rating { get; init; } = 5;
    [Required] public DateOnly? Date { get; init; }
    public bool IsVisible { get; init; } = true;
}

public static class ReviewMap
{
    public static ReviewDto ToDto(this Review r) =>
        new(r.Id, TrDto.From(r.Name), r.Model, r.Year, r.Service, r.Rating, r.Date, TrDto.From(r.Text));

    public static AdminReviewDto ToAdminDto(this Review r) =>
        new(r.Id, TrDto.From(r.Name), r.Model, r.Year, r.Service, r.Rating, r.Date, TrDto.From(r.Text), r.IsVisible, r.CreatedAt, r.UpdatedAt);

    public static void Apply(this SaveReviewDto d, Review r)
    {
        static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();
        var (name, text) = (d.NameAr.Trim(), d.TextAr.Trim());
        r.Name = new Tr(name, Clean(d.NameEn) ?? name);
        r.Text = new Tr(text, Clean(d.TextEn) ?? text);
        r.Model = Clean(d.Model); r.Year = d.Year; r.Service = Clean(d.Service);
        r.Rating = d.Rating; r.Date = d.Date!.Value; r.IsVisible = d.IsVisible;
    }
}
