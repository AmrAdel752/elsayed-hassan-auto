using System.Security.Cryptography;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace ElSayedHassan.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController(BookingService bookings, ILogger<BookingsController> log) : ControllerBase
{
    /// <summary>
    /// Create a booking. 201 = saved (returns the code for WhatsApp), 400 = validation,
    /// 409 = slot just filled / already booked in this slot, 429 = too many requests or bookings.
    /// </summary>
    [HttpPost]
    [EnableRateLimiting(RateLimits.Bookings)]
    [ProducesResponseType<BookingCreatedDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Create(CreateBookingDto dto, CancellationToken ct)
    {
        // Honeypot filled => bot. Pretend success so it doesn't retry, save nothing.
        if (!string.IsNullOrEmpty(dto.Website))
        {
            log.LogWarning("Honeypot booking dropped from {Ip}", HttpContext.Connection.RemoteIpAddress);
            return StatusCode(StatusCodes.Status201Created,
                new BookingCreatedDto($"SHA-{RandomNumberGenerator.GetInt32(10000, 100000)}", dto.Date, dto.Hour));
        }

        var r = await bookings.CreateAsync(dto, ct);
        return r.Error switch
        {
            BookingError.None => StatusCode(StatusCodes.Status201Created, r.Booking),
            BookingError.Invalid => ValidationProblem(new ValidationProblemDetails(r.Errors!)),
            BookingError.SlotFull => Problem(statusCode: 409, title: "slot_full",
                detail: "This hour has just been fully booked. Please choose another time."),
            BookingError.DuplicateInSlot => Problem(statusCode: 409, title: "already_booked",
                detail: "This phone number already has a booking at this time."),
            _ => Problem(statusCode: 429, title: "too_many_bookings",
                detail: $"This phone number already has {BookingService.MaxUpcomingPerPhone} upcoming bookings."),
        };
    }
}
