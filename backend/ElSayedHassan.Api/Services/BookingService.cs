using System.Data;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

public enum BookingError { None, Invalid, SlotFull, DuplicateInSlot, TooManyUpcoming }

public record BookingResult(BookingError Error, BookingCreatedDto? Booking = null, Dictionary<string, string[]>? Errors = null);

public partial class BookingService(AppDbContext db, SlotService slots, CairoClock clock, BookingNotifier notifier, ILogger<BookingService> log)
{
    /// <summary>Spam guard: max active upcoming bookings per phone.</summary>
    public const int MaxUpcomingPerPhone = 3;

    [GeneratedRegex(@"^[a-z0-9][a-z0-9\-]{0,49}$")]
    private static partial Regex Slug();

    public async Task<BookingResult> CreateAsync(CreateBookingDto dto, CancellationToken ct)
    {
        // ---- validation (beyond DataAnnotations) ----
        var errors = new Dictionary<string, string[]>();
        var phone = EgyptPhone.Normalize(dto.Phone);
        if (phone is null) errors["phone"] = ["Enter a valid Egyptian mobile number (01xxxxxxxxx)."];

        var services = dto.Services.Select(s => (s ?? "").Trim().ToLowerInvariant()).Distinct().ToList();
        if (services.Count == 0 || services.Any(s => !Slug().IsMatch(s))) errors["services"] = ["Invalid services."];

        if (dto.Year > clock.Today.Year + 1) errors["year"] = ["Invalid year."];

        var settings = await slots.GetSettingsAsync(ct);
        var block = await slots.CheckAsync(settings, dto.Date, dto.Hour, ct);
        if (block != SlotBlock.None)
            errors[block is SlotBlock.OutsideHours or SlotBlock.HourClosed ? "hour" : "date"] = [block switch
            {
                SlotBlock.Past => "This time has already passed.",
                SlotBlock.TooFar => $"You can book up to {settings.MaxDaysAhead} days ahead.",
                SlotBlock.OutsideHours => $"Working hours are {settings.OpenHour}:00-{settings.CloseHour}:00.",
                SlotBlock.DayClosed => "We are closed on this day.",
                _ => "This hour is closed.",
            }];

        if (errors.Count > 0) return new BookingResult(BookingError.Invalid, Errors: errors);

        // ---- capacity check + insert, serialized per slot ----
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);

        // Two requests for the same slot can't both read "2 taken" and both insert; other slots are not blocked.
        await slots.LockSlotAsync(dto.Date, dto.Hour, ct);

        var inSlot = await slots.ActiveBookings()
            .Where(b => b.Date == dto.Date && b.Hour == dto.Hour)
            .Select(b => b.Phone).ToListAsync(ct);

        if (inSlot.Contains(phone!)) return new BookingResult(BookingError.DuplicateInSlot);
        if (inSlot.Count >= settings.Capacity) return new BookingResult(BookingError.SlotFull);

        var today = clock.Today;
        var upcoming = await slots.ActiveBookings().CountAsync(b =>
            b.Phone == phone && b.Date >= today &&
            b.Status != BookingStatus.Done && b.Status != BookingStatus.NoShow, ct);
        if (upcoming >= MaxUpcomingPerPhone) return new BookingResult(BookingError.TooManyUpcoming);

        var booking = new Booking
        {
            Code = await NewCodeAsync(ct),
            Name = dto.Name.Trim(),
            Phone = phone!,
            Model = dto.Model.Trim(),
            Generation = string.IsNullOrWhiteSpace(dto.Generation) ? null : dto.Generation.Trim(),
            Year = dto.Year,
            Km = string.IsNullOrWhiteSpace(dto.Km) ? null : dto.Km.Trim(),
            Services = services,
            Date = dto.Date,
            Hour = dto.Hour,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
        };
        db.Bookings.Add(booking);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        log.LogInformation("Booking {Code} created for {Date} {Hour}:00", booking.Code, booking.Date, booking.Hour);
        notifier.NewBooking(booking);   // email the owner (if configured), in the background
        return new BookingResult(BookingError.None, new BookingCreatedDto(booking.Code, booking.Date, booking.Hour));
    }

    /// <summary>SHA-xxxxx (5 digits), unique (also enforced by a unique index).</summary>
    private async Task<string> NewCodeAsync(CancellationToken ct)
    {
        for (var i = 0; i < 10; i++)
        {
            var code = $"SHA-{RandomNumberGenerator.GetInt32(10000, 100000)}";
            if (!await db.Bookings.AnyAsync(b => b.Code == code, ct)) return code;
        }
        return $"SHA-{RandomNumberGenerator.GetInt32(100000, 1000000)}";   // practically never
    }
}
