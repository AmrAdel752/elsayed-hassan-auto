using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers.Admin;

/// <summary>Slot rules (capacity / hours) and closures. Reading and closing: Owner or Staff. Changing the rules: Owner only.</summary>
[Route("api/admin/slots")]
public class AdminSlotsController(AppDbContext db, SlotService slots, CairoClock clock) : AdminControllerBase
{
    [HttpGet]
    public async Task<ActionResult<SlotAdminDto>> Get(CancellationToken ct)
    {
        var s = await slots.GetSettingsAsync(ct);
        var today = clock.Today;
        var days = await db.ClosedDays.AsNoTracking().Where(d => d.Date >= today).OrderBy(d => d.Date)
            .Select(d => new ClosedDayDto(d.Id, d.Date, d.Reason)).ToListAsync(ct);
        var hours = await db.ClosedSlots.AsNoTracking().Where(c => c.Date >= today).OrderBy(c => c.Date).ThenBy(c => c.Hour)
            .Select(c => new ClosedSlotDto(c.Id, c.Date, c.Hour, c.Reason)).ToListAsync(ct);
        return new SlotAdminDto(ToDto(s), days, hours);
    }

    /// <summary>Change capacity / working hours / booking window. Existing bookings are never touched.</summary>
    [HttpPut("settings")]
    [Authorize(Policy = AdminPolicies.Owner)]
    public async Task<ActionResult<SlotSettingsDto>> UpdateSettings(SlotSettingsDto dto, CancellationToken ct)
    {
        var s = await db.SlotSettings.OrderBy(x => x.Id).FirstAsync(ct);
        (s.Capacity, s.OpenHour, s.CloseHour, s.MaxDaysAhead) = (dto.Capacity, dto.OpenHour, dto.CloseHour, dto.MaxDaysAhead);
        await db.SaveChangesAsync(ct);
        return ToDto(s);
    }

    /// <summary>Close a whole day. 409 if it's already closed.</summary>
    [HttpPost("closed-days")]
    [ProducesResponseType<ClosedResultDto<ClosedDayDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CloseDay(CloseDayDto dto, CancellationToken ct)
    {
        if (dto.Date < clock.Today) return ValidationProblem(Invalid("date", "The date is in the past."));
        if (await db.ClosedDays.AnyAsync(d => d.Date == dto.Date, ct))
            return Problem(statusCode: 409, title: "already_closed");

        var row = new ClosedDay { Date = dto.Date, Reason = Clean(dto.Reason) };
        db.ClosedDays.Add(row);
        await db.SaveChangesAsync(ct);
        var active = await slots.ActiveBookings().CountAsync(b => b.Date == dto.Date, ct);
        return StatusCode(201, new ClosedResultDto<ClosedDayDto>(new ClosedDayDto(row.Id, row.Date, row.Reason), active));
    }

    [HttpDelete("closed-days/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> OpenDay(int id, CancellationToken ct) =>
        await db.ClosedDays.Where(d => d.Id == id).ExecuteDeleteAsync(ct) == 0
            ? Problem(statusCode: 404, title: "not_found") : NoContent();

    /// <summary>Close one hour on one day. 409 if it's already closed.</summary>
    [HttpPost("closed-slots")]
    [ProducesResponseType<ClosedResultDto<ClosedSlotDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CloseSlot(CloseSlotDto dto, CancellationToken ct)
    {
        if (dto.Date < clock.Today) return ValidationProblem(Invalid("date", "The date is in the past."));
        if (await db.ClosedSlots.AnyAsync(c => c.Date == dto.Date && c.Hour == dto.Hour, ct))
            return Problem(statusCode: 409, title: "already_closed");

        var row = new ClosedSlot { Date = dto.Date, Hour = dto.Hour, Reason = Clean(dto.Reason) };
        db.ClosedSlots.Add(row);
        await db.SaveChangesAsync(ct);
        var active = await slots.ActiveBookings().CountAsync(b => b.Date == dto.Date && b.Hour == dto.Hour, ct);
        return StatusCode(201, new ClosedResultDto<ClosedSlotDto>(new ClosedSlotDto(row.Id, row.Date, row.Hour, row.Reason), active));
    }

    [HttpDelete("closed-slots/{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> OpenSlot(int id, CancellationToken ct) =>
        await db.ClosedSlots.Where(c => c.Id == id).ExecuteDeleteAsync(ct) == 0
            ? Problem(statusCode: 404, title: "not_found") : NoContent();

    private static SlotSettingsDto ToDto(SlotSettings s) =>
        new() { Capacity = s.Capacity, OpenHour = s.OpenHour, CloseHour = s.CloseHour, MaxDaysAhead = s.MaxDaysAhead };

    private static string? Clean(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static ValidationProblemDetails Invalid(string field, string message) =>
        new(new Dictionary<string, string[]> { [field] = [message] });
}
