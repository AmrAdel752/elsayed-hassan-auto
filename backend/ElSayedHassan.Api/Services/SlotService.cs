using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

/// <summary>Why a slot can't be booked (null = bookable if there's capacity).</summary>
public enum SlotBlock { None, Past, TooFar, OutsideHours, DayClosed, HourClosed }

public class SlotService(AppDbContext db, CairoClock clock)
{
    public Task<SlotSettings> GetSettingsAsync(CancellationToken ct) =>
        db.SlotSettings.AsNoTracking().OrderBy(s => s.Id).FirstAsync(ct);

    /// <summary>Bookings that take a place in a slot (everything except cancelled).</summary>
    public IQueryable<Booking> ActiveBookings() =>
        db.Bookings.Where(b => b.Status != BookingStatus.Cancelled);

    /// <summary>Time/rules check without DB lookups for closures (used for every hour in the grid).</summary>
    public SlotBlock CheckTime(SlotSettings s, DateOnly date, int hour)
    {
        var now = clock.Now;
        var today = DateOnly.FromDateTime(now);
        if (hour < s.OpenHour || hour >= s.CloseHour) return SlotBlock.OutsideHours;
        if (date < today || (date == today && hour <= now.Hour)) return SlotBlock.Past;   // current hour already started
        if (date > today.AddDays(s.MaxDaysAhead)) return SlotBlock.TooFar;
        return SlotBlock.None;
    }

    /// <summary>Full check for one slot, including owner closures.</summary>
    public async Task<SlotBlock> CheckAsync(SlotSettings s, DateOnly date, int hour, CancellationToken ct)
    {
        var block = CheckTime(s, date, hour);
        if (block != SlotBlock.None) return block;
        if (await db.ClosedDays.AnyAsync(d => d.Date == date, ct)) return SlotBlock.DayClosed;
        if (await db.ClosedSlots.AnyAsync(c => c.Date == date && c.Hour == hour, ct)) return SlotBlock.HourClosed;
        return SlotBlock.None;
    }

    /// <summary>Availability grid for <paramref name="days"/> days starting at <paramref name="from"/>.</summary>
    public async Task<List<SlotDayDto>> GetGridAsync(DateOnly from, int days, CancellationToken ct)
    {
        var s = await GetSettingsAsync(ct);
        var to = from.AddDays(days);   // exclusive

        var closedDays = (await db.ClosedDays.AsNoTracking()
            .Where(d => d.Date >= from && d.Date < to).Select(d => d.Date).ToListAsync(ct)).ToHashSet();

        var closedSlots = (await db.ClosedSlots.AsNoTracking()
            .Where(c => c.Date >= from && c.Date < to).Select(c => new { c.Date, c.Hour }).ToListAsync(ct))
            .Select(c => (c.Date, c.Hour)).ToHashSet();

        var taken = (await ActiveBookings().AsNoTracking()
            .Where(b => b.Date >= from && b.Date < to)
            .GroupBy(b => new { b.Date, b.Hour })
            .Select(g => new { g.Key.Date, g.Key.Hour, Count = g.Count() })
            .ToListAsync(ct))
            .ToDictionary(x => (x.Date, x.Hour), x => x.Count);

        var result = new List<SlotDayDto>(days);
        for (var date = from; date < to; date = date.AddDays(1))
        {
            var dayClosed = closedDays.Contains(date);
            var hours = new List<SlotHourDto>(s.CloseHour - s.OpenHour);
            for (var h = s.OpenHour; h < s.CloseHour; h++)
            {
                var left = 0;
                if (!dayClosed && !closedSlots.Contains((date, h)) && CheckTime(s, date, h) == SlotBlock.None)
                    left = Math.Max(0, s.Capacity - taken.GetValueOrDefault((date, h)));
                hours.Add(new SlotHourDto(h, left));
            }
            result.Add(new SlotDayDto(date, dayClosed, hours));
        }
        return result;
    }
}
