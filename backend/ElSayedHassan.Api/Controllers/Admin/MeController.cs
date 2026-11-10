using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Controllers.Admin;

/// <summary><c>GET /api/admin/me</c>: who is logged in (used by the dashboard to check the token is still valid).</summary>
public class MeController(AppDbContext db) : AdminControllerBase
{
    [HttpGet]
    [ProducesResponseType<AdminUserDto>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var u = await db.AdminUsers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == AdminId, ct);
        // account deleted or disabled after the token was issued
        if (u is null || !u.IsActive) return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "account_disabled");
        return Ok(new AdminUserDto(u.Id, u.UserName, u.DisplayName, u.Role.ToString()));
    }
}
