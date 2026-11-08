using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ElSayedHassan.Api.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController(SlotService slots, CairoClock clock) : ControllerBase
{
    /// <summary>Places left per day/hour. <c>from</c> defaults to today (Cairo), <c>days</c> 1–31 (default 14).</summary>
    [HttpGet]
    public async Task<ActionResult<List<SlotDayDto>>> Get([FromQuery] DateOnly? from, [FromQuery] int days = 14, CancellationToken ct = default)
    {
        if (days is < 1 or > 31)
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
            { ["days"] = ["days must be between 1 and 31."] }));

        var today = clock.Today;
        var start = from is { } f && f > today ? f : today;   // never return the past
        return await slots.GetGridAsync(start, days, ct);
    }
}
