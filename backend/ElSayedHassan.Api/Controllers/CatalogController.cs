using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers;

/// <summary>Public catalog for the website: only active items, same shapes as the old static data.</summary>
[ApiController]
[Route("api")]
public class CatalogController(AppDbContext db, TimeProvider time) : ControllerBase
{
    [HttpGet("categories")]
    public async Task<List<CategoryDto>> Categories(CancellationToken ct) =>
        (await db.Categories.AsNoTracking().Where(c => c.IsActive).OrderBy(c => c.SortOrder).ThenBy(c => c.Id).ToListAsync(ct))
        .Select(c => c.ToDto()).ToList();

    /// <summary>
    /// Products. Optional filters: <c>cat</c> (category slug), <c>model</c> (e.g. Sunny), <c>q</c> (name / brand),
    /// <c>featured=true</c>, <c>inStock=true</c>.
    /// </summary>
    [HttpGet("products")]
    public async Task<List<ProductDto>> Products(
        [FromQuery] string? cat, [FromQuery] string? model, [FromQuery] string? q,
        [FromQuery] bool? featured, [FromQuery] bool? inStock, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking().Include(p => p.Category).Where(p => p.IsActive && p.Category.IsActive);
        if (!string.IsNullOrWhiteSpace(cat)) query = query.Where(p => p.Category.Slug == cat);
        if (featured is { } f) query = query.Where(p => p.Featured == f);
        if (inStock is { } s) query = query.Where(p => p.InStock == s);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(p => p.Name.Ar.Contains(term) || p.Name.En.Contains(term) || p.Brand.Contains(term));
        }

        var rows = await query.OrderBy(p => p.SortOrder).ThenBy(p => p.Id).ToListAsync(ct);
        // the model list is a small JSON column; filter it in memory (works on every SQL Server version)
        if (!string.IsNullOrWhiteSpace(model))
            rows = rows.Where(p => p.Models.Contains(model.Trim(), StringComparer.OrdinalIgnoreCase)).ToList();
        return rows.Select(p => p.ToDto()).ToList();
    }

    [HttpGet("products/{slug}")]
    [ProducesResponseType<ProductDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Product(string slug, CancellationToken ct)
    {
        var p = await db.Products.AsNoTracking().Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsActive && x.Category.IsActive, ct);
        return p is null ? Problem(statusCode: 404, title: "not_found") : Ok(p.ToDto());
    }

    /// <summary>Offers that are active and not finished yet, soonest to end first within the same sort order.</summary>
    [HttpGet("offers")]
    public async Task<List<OfferDto>> Offers(CancellationToken ct)
    {
        var now = time.GetUtcNow();
        return (await db.Offers.AsNoTracking().Where(o => o.IsActive && o.EndsAt > now)
                .OrderBy(o => o.SortOrder).ThenBy(o => o.EndsAt).ToListAsync(ct))
            .Select(o => o.ToDto()).ToList();
    }
}
