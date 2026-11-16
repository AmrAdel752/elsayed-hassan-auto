using ElSayedHassan.Api.Controllers.Admin;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers;

/// <summary>Public: visible gallery tiles and before/after pairs, in dashboard order.</summary>
[ApiController]
[Route("api/gallery")]
public class GalleryController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<GalleryDto> Get(CancellationToken ct)
    {
        var items = await db.GalleryItems.AsNoTracking().Where(g => g.IsVisible).OrderBy(g => g.SortOrder).ThenBy(g => g.Id).ToListAsync(ct);
        var pairs = await db.BeforeAfters.AsNoTracking().Where(b => b.IsVisible).OrderBy(b => b.SortOrder).ThenBy(b => b.Id).ToListAsync(ct);
        return new GalleryDto(items.Select(g => g.ToDto()).ToList(), pairs.Select(b => b.ToDto()).ToList());
    }
}

/// <summary>Dashboard: gallery tiles (hidden ones included).</summary>
[Route("api/admin/gallery")]
public class AdminGalleryController(AppDbContext db, TimeProvider time) : AdminControllerBase
{
    [HttpGet]
    public async Task<List<AdminGalleryItemDto>> List(CancellationToken ct) =>
        (await db.GalleryItems.AsNoTracking().OrderBy(g => g.SortOrder).ThenBy(g => g.Id).ToListAsync(ct)).Select(g => g.ToAdminDto()).ToList();

    [HttpPost]
    [ProducesResponseType<AdminGalleryItemDto>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(SaveGalleryItemDto dto, CancellationToken ct)
    {
        var g = new GalleryItem();
        dto.Apply(g);
        db.GalleryItems.Add(g);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, g.ToAdminDto());
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminGalleryItemDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, SaveGalleryItemDto dto, CancellationToken ct)
    {
        var g = await db.GalleryItems.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (g is null) return Problem(statusCode: 404, title: "not_found");
        dto.Apply(g);
        g.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(g.ToAdminDto());
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var g = await db.GalleryItems.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (g is null) return Problem(statusCode: 404, title: "not_found");
        db.GalleryItems.Remove(g);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

/// <summary>Dashboard: before / after pairs (hidden ones included).</summary>
[Route("api/admin/before-after")]
public class AdminBeforeAfterController(AppDbContext db, TimeProvider time) : AdminControllerBase
{
    [HttpGet]
    public async Task<List<AdminBeforeAfterDto>> List(CancellationToken ct) =>
        (await db.BeforeAfters.AsNoTracking().OrderBy(b => b.SortOrder).ThenBy(b => b.Id).ToListAsync(ct)).Select(b => b.ToAdminDto()).ToList();

    [HttpPost]
    [ProducesResponseType<AdminBeforeAfterDto>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(SaveBeforeAfterDto dto, CancellationToken ct)
    {
        var b = new BeforeAfter();
        dto.Apply(b);
        db.BeforeAfters.Add(b);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, b.ToAdminDto());
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminBeforeAfterDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, SaveBeforeAfterDto dto, CancellationToken ct)
    {
        var b = await db.BeforeAfters.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (b is null) return Problem(statusCode: 404, title: "not_found");
        dto.Apply(b);
        b.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(b.ToAdminDto());
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var b = await db.BeforeAfters.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (b is null) return Problem(statusCode: 404, title: "not_found");
        db.BeforeAfters.Remove(b);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
