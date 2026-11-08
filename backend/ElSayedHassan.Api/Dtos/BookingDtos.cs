using System.ComponentModel.DataAnnotations;

namespace ElSayedHassan.Api.Dtos;

public record CreateBookingDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; init; } = "";

    /// <summary>Egyptian mobile: 01xxxxxxxxx, +201xxxxxxxxx, 00201..., Arabic digits allowed.</summary>
    [Required, StringLength(20)]
    public string Phone { get; init; } = "";

    [Required, StringLength(50), RegularExpression(@"^[A-Za-z0-9\- ]+$")]
    public string Model { get; init; } = "";

    [StringLength(50), RegularExpression(@"^[A-Za-z0-9\-/ .]+$")]
    public string? Generation { get; init; }

    [Range(1980, 2100)]
    public int? Year { get; init; }

    [StringLength(20)]
    public string? Km { get; init; }

    /// <summary>Service slugs, 1–10.</summary>
    [Required, MinLength(1), MaxLength(10)]
    public List<string> Services { get; init; } = [];

    [Required]
    public DateOnly Date { get; init; }

    [Range(0, 23)]
    public int Hour { get; init; }

    [StringLength(1000)]
    public string? Notes { get; init; }

    /// <summary>Honeypot: hidden field in the form. Real users leave it empty; bots fill it.</summary>
    public string? Website { get; init; }
}

public record BookingCreatedDto(string Code, DateOnly Date, int Hour);
