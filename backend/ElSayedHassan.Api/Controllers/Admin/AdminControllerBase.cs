using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ElSayedHassan.Api.Controllers.Admin;

/// <summary>
/// Base for every dashboard controller. All routes live under <c>/api/admin/...</c> and need a valid
/// admin JWT (role Owner or Staff). Owner-only actions add <c>[Authorize(Policy = AdminPolicies.Owner)]</c>.
/// A startup check (<see cref="AdminRouteGuard"/>) makes sure nothing under /api/admin skips this.
/// </summary>
[ApiController]
[Authorize(Policy = AdminPolicies.Admin)]
[Route("api/admin/[controller]")]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
[ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
public abstract class AdminControllerBase : ControllerBase
{
    /// <summary>Logged-in admin id (the token's "sub").</summary>
    protected int AdminId => int.Parse(User.FindFirst("sub")!.Value);
}

public static class AdminPolicies
{
    /// <summary>Any dashboard user (Owner or Staff).</summary>
    public const string Admin = "admin";
    /// <summary>Owner only (settings, users).</summary>
    public const string Owner = "owner";

    public static IServiceCollection AddAdminPolicies(this IServiceCollection services) =>
        services.AddAuthorizationBuilder()
            .AddPolicy(Admin, p => p.RequireAuthenticatedUser().RequireRole("Owner", "Staff"))
            .AddPolicy(Owner, p => p.RequireAuthenticatedUser().RequireRole("Owner"))
            .Services;
}
