using System.Data;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers.Admin;

[Route("api/admin/bookings")]
public class AdminBookingsController(AppDbContext db, SlotService slots, CairoClock clock, TimeProvider time, ILogger<AdminBookingsController> log)
    : AdminControllerBase
{
    /// <summary>Bookings list with filters + paging. Default order: soonest appointment first.</summary>
    [HttpGet]
    public async Task<ActionResult<PagedDto<AdminBookingDto>>> List([FromQuery] BookingQuery filter, CancellationToken ct)
    {
        // NOTE: the parameter is not named "q" on purpose. The query string has a "q" key, and MVC would
        // treat that as this object's prefix and bind none of the filters.
        var query = db.Bookings.AsNoTracking();

        if (filter.Date is { } d) query = query.Where(b => b.Date == d);
        else
        {
            if (filter.From is { } f) query = query.Where(b => b.Date >= f);
            if (filter.To is { } t) query = query.Where(b => b.Date <= t);
        }
        if (filter.Status is { } s) query = query.Where(b => b.Status == s);

        if (!string.IsNullOrWhiteSpace(filter.Q))
        {
            var term = filter.Q.Trim();
            var phone = EgyptPhone.Normalize(term) ?? term;   // "+20 10..." finds "010..."
            query = query.Where(b => b.Code.Contains(term) || b.Name.Contains(term) || b.Phone.Contains(phone));
        }

        var total = await query.CountAsync(ct);
        query = filter.Sort?.ToLowerInvariant() == "newest"
            ? query.OrderByDescending(b => b.CreatedAt).ThenByDescending(b => b.Id)
            : query.OrderBy(b => b.Date).ThenBy(b => b.Hour).ThenBy(b => b.Id);

        var rows = await query.Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync(ct);
        return new PagedDto<AdminBookingDto>(rows.Select(AdminBookingDto.From).ToList(), total, filter.Page, filter.PageSize);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<AdminBookingDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var b = await db.Bookings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return b is null ? Problem(statusCode: 404, title: "not_found") : Ok(AdminBookingDto.From(b));
    }

    /// <summary>
    /// Change status and/or the internal note. Re-activating a cancelled booking takes a place again,
    /// so it returns 409 <c>slot_full</c> if the hour is already full.
    /// </summary>
    [HttpPatch("{id:int}")]
    [ProducesResponseType<AdminBookingDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, UpdateBookingDto dto, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);

        var b = await db.Bookings.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (b is null) return Problem(statusCode: 404, title: "not_found");

        if (dto.Status is { } status && status != b.Status)
        {
            if (b.Status == BookingStatus.Cancelled)
            {
                // same per-slot lock as public booking, so a customer can't grab the place at the same moment
                await slots.LockSlotAsync(b.Date, b.Hour, ct);
                var settings = await slots.GetSettingsAsync(ct);
                var taken = await slots.ActiveBookings().CountAsync(x => x.Date == b.Date && x.Hour == b.Hour, ct);
                if (taken >= settings.Capacity)
                    return Problem(statusCode: 409, title: "slot_full", detail: "This hour is already full.");
            }
            log.LogInformation("Booking {Code}: {Old} -> {New} by admin {Admin}", b.Code, b.Status, status, AdminId);
            b.Status = status;
        }

        if (dto.AdminNote is not null)
            b.AdminNote = string.IsNullOrWhiteSpace(dto.AdminNote) ? null : dto.AdminNote.Trim();

        b.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(AdminBookingDto.From(b));
    }

    /// <summary>Numbers for the dashboard home: today's counts, new (unconfirmed), next 7 days, next 5 appointments.</summary>
    [HttpGet("/api/admin/dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard(CancellationToken ct)
    {
        var now = clock.Now;
        var today = DateOnly.FromDateTime(now);
        var weekEnd = today.AddDays(6);

        var byStatus = await db.Bookings.AsNoTracking().Where(b => b.Date == today)
            .GroupBy(b => b.Status).Select(g => new { Status = g.Key, Count = g.Count() }).ToListAsync(ct);
        int Of(BookingStatus s) => byStatus.FirstOrDefault(x => x.Status == s)?.Count ?? 0;

        var newCount = await db.Bookings.CountAsync(b => b.Date >= today && b.Status == BookingStatus.New, ct);
        var upcoming = await db.Bookings.CountAsync(b => b.Date >= today && b.Date <= weekEnd &&
            (b.Status == BookingStatus.New || b.Status == BookingStatus.Confirmed), ct);

        var next = await db.Bookings.AsNoTracking()
            .Where(b => (b.Status == BookingStatus.New || b.Status == BookingStatus.Confirmed) &&
                        (b.Date > today || (b.Date == today && b.Hour >= now.Hour)))
            .OrderBy(b => b.Date).ThenBy(b => b.Hour).ThenBy(b => b.Id).Take(5).ToListAsync(ct);

        return new DashboardDto(today,
            new DayCountsDto(byStatus.Sum(x => x.Count), Of(BookingStatus.New), Of(BookingStatus.Confirmed),
                Of(BookingStatus.Done), Of(BookingStatus.Cancelled), Of(BookingStatus.NoShow)),
            newCount, upcoming, next.Select(AdminBookingDto.From).ToList());
    }
}
