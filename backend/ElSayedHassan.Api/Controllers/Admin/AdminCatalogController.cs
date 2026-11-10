using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers.Admin;

/// <summary>Dashboard CRUD for categories. Lists include hidden (inactive) rows.</summary>
[Route("api/admin/categories")]
public class AdminCategoriesController(AppDbContext db) : AdminControllerBase
{
    private static AdminCategoryDto ToDto(Category c, int products) =>
        new(c.Id, c.Slug, c.Icon, TrDto.From(c.Name), c.SortOrder, c.IsActive, products);

    [HttpGet]
    public async Task<List<AdminCategoryDto>> List(CancellationToken ct) =>
        (await db.Categories.AsNoTracking().OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
            .Select(c => new { c, Count = c.Products.Count }).ToListAsync(ct))
        .Select(x => ToDto(x.c, x.Count)).ToList();

    [HttpPost]
    [ProducesResponseType<AdminCategoryDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(SaveCategoryDto dto, CancellationToken ct)
    {
        if (await db.Categories.AnyAsync(c => c.Slug == dto.Slug, ct)) return SlugTaken();
        var c = new Category { Slug = dto.Slug, Icon = dto.Icon.Trim(), Name = dto.Name.ToEntity(), SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        db.Categories.Add(c);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, ToDto(c, 0));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminCategoryDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, SaveCategoryDto dto, CancellationToken ct)
    {
        var c = await db.Categories.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (c is null) return Problem(statusCode: 404, title: "not_found");
        if (await db.Categories.AnyAsync(x => x.Slug == dto.Slug && x.Id != id, ct)) return SlugTaken();

        (c.Slug, c.Icon, c.Name, c.SortOrder, c.IsActive) = (dto.Slug, dto.Icon.Trim(), dto.Name.ToEntity(), dto.SortOrder, dto.IsActive);
        await db.SaveChangesAsync(ct);
        return Ok(ToDto(c, await db.Products.CountAsync(p => p.CategoryId == id, ct)));
    }

    /// <summary>409 <c>category_in_use</c> while it still has products (move or delete them first, or just hide it).</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        if (await db.Products.AnyAsync(p => p.CategoryId == id, ct))
            return Problem(statusCode: 409, title: "category_in_use", detail: "This category still has products.");
        return await db.Categories.Where(c => c.Id == id).ExecuteDeleteAsync(ct) == 0
            ? Problem(statusCode: 404, title: "not_found") : NoContent();
    }

    private ObjectResult SlugTaken() => Problem(statusCode: 409, title: "slug_taken", detail: "Another category already uses this slug.");
}

/// <summary>Dashboard CRUD for products. Lists include hidden (inactive) rows.</summary>
[Route("api/admin/products")]
public class AdminProductsController(AppDbContext db, TimeProvider time) : AdminControllerBase
{
    /// <summary>All products (optional <c>q</c> = name / brand / slug, <c>categoryId</c>, <c>active</c>).</summary>
    [HttpGet]
    public async Task<List<AdminProductDto>> List([FromQuery] string? q, [FromQuery] int? categoryId, [FromQuery] bool? active, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking().Include(p => p.Category).AsQueryable();
        if (categoryId is { } cid) query = query.Where(p => p.CategoryId == cid);
        if (active is { } a) query = query.Where(p => p.IsActive == a);
        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(p => p.Name.Ar.Contains(term) || p.Name.En.Contains(term) || p.Brand.Contains(term) || p.Slug.Contains(term));
        }
        return (await query.OrderBy(p => p.SortOrder).ThenBy(p => p.Id).ToListAsync(ct)).Select(p => p.ToAdminDto()).ToList();
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<AdminProductDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var p = await db.Products.AsNoTracking().Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == id, ct);
        return p is null ? Problem(statusCode: 404, title: "not_found") : Ok(p.ToAdminDto());
    }

    [HttpPost]
    [ProducesResponseType<AdminProductDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(SaveProductDto dto, CancellationToken ct)
    {
        if (await Check(dto, null, ct) is { } error) return error;
        var p = new Product();
        dto.Apply(p);
        db.Products.Add(p);
        await db.SaveChangesAsync(ct);
        await db.Entry(p).Reference(x => x.Category).LoadAsync(ct);
        return StatusCode(201, p.ToAdminDto());
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminProductDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, SaveProductDto dto, CancellationToken ct)
    {
        var p = await db.Products.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return Problem(statusCode: 404, title: "not_found");
        if (await Check(dto, id, ct) is { } error) return error;

        dto.Apply(p);
        p.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        await db.Entry(p).Reference(x => x.Category).LoadAsync(ct);
        return Ok(p.ToAdminDto());
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct) =>
        await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync(ct) == 0
            ? Problem(statusCode: 404, title: "not_found") : NoContent();

    private async Task<IActionResult?> Check(SaveProductDto dto, int? id, CancellationToken ct)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == dto.CategoryId, ct))
            return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]> { ["categoryId"] = ["Category not found."] }));
        if (await db.Products.AnyAsync(p => p.Slug == dto.Slug && p.Id != id, ct))
            return Problem(statusCode: 409, title: "slug_taken", detail: "Another product already uses this slug.");
        return null;
    }
}

/// <summary>Dashboard CRUD for offers. Lists include hidden and expired offers (<c>expired</c> flag).</summary>
[Route("api/admin/offers")]
public class AdminOffersController(AppDbContext db, TimeProvider time) : AdminControllerBase
{
    [HttpGet]
    public async Task<List<AdminOfferDto>> List(CancellationToken ct)
    {
        var now = time.GetUtcNow();
        return (await db.Offers.AsNoTracking().OrderBy(o => o.SortOrder).ThenBy(o => o.EndsAt).ToListAsync(ct))
            .Select(o => o.ToAdminDto(now)).ToList();
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType<AdminOfferDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var o = await db.Offers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        return o is null ? Problem(statusCode: 404, title: "not_found") : Ok(o.ToAdminDto(time.GetUtcNow()));
    }

    [HttpPost]
    [ProducesResponseType<AdminOfferDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(SaveOfferDto dto, CancellationToken ct)
    {
        if (await db.Offers.AnyAsync(o => o.Slug == dto.Slug, ct)) return SlugTaken();
        var o = new Offer();
        dto.Apply(o);
        db.Offers.Add(o);
        await db.SaveChangesAsync(ct);
        return StatusCode(201, o.ToAdminDto(time.GetUtcNow()));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<AdminOfferDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(int id, SaveOfferDto dto, CancellationToken ct)
    {
        var o = await db.Offers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (o is null) return Problem(statusCode: 404, title: "not_found");
        if (await db.Offers.AnyAsync(x => x.Slug == dto.Slug && x.Id != id, ct)) return SlugTaken();

        dto.Apply(o);
        o.UpdatedAt = time.GetUtcNow().UtcDateTime;
        await db.SaveChangesAsync(ct);
        return Ok(o.ToAdminDto(time.GetUtcNow()));
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        // tracked delete (not ExecuteDelete) so the owned JSON column is handled by EF
        var o = await db.Offers.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (o is null) return Problem(statusCode: 404, title: "not_found");
        db.Offers.Remove(o);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private ObjectResult SlugTaken() => Problem(statusCode: 409, title: "slug_taken", detail: "Another offer already uses this slug.");
}
