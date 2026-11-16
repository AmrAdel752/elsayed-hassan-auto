using ElSayedHassan.Api.Controllers.Admin;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers;

/// <summary>Public: visible customer reviews, newest first.</summary>
[ApiController]
[Route("api/reviews")]
public class ReviewsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<ReviewDto>> List(CancellationToken ct) =>
        (await db.Reviews.AsNoTracking().Where(r => r.IsVisible)
            .OrderByDescending(r => r.Date).ThenByDescending(r => r.Id).ToListAsync(ct))
        .Select(r => r.ToDto()).ToList();
}

/// <summary>Dashboard: add, edit, hide/show and delete customer reviews (hidden ones included in the list).</summary>
[Route("api/admin/reviews")]
public class AdminReviewsController(AppDbContext db, TimeProvider time) : AdminControllerBase
{
    [HttpGet]
    public async Task<List<AdminReviewDto>> List(CancellationToken ct) =>
        (await db.Reviews.AsNoTracking().OrderByDescending(r => r.Date).ThenByDescending(r => r.Id).ToListAsync(ct))
        .Select(r => r.ToAdminDto()).ToList();

    [HttpPost]
    [ProducesResponseType<AdminReviewDto>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(SaveReviewDto dto, CancellationToken ct)
    {
        var r = new Review();
        dto.Apply(r);
        db.Reviews.Add(r);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, r.ToAdminDto());
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminReviewDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, SaveReviewDto dto, CancellationToken ct)
    {
        var r = await db.Reviews.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (r is null) return Problem(statusCode: 404, title: "not_found");
        dto.Apply(r);
        r.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(r.ToAdminDto());
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var r = await db.Reviews.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (r is null) return Problem(statusCode: 404, title: "not_found");
        db.Reviews.Remove(r);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
