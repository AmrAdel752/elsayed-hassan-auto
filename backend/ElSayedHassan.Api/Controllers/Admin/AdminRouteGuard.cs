using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace ElSayedHassan.Api.Controllers.Admin;

/// <summary>
/// Safety net, checked once at startup: every action under /api/admin must require authorization and
/// must not be [AllowAnonymous]. If someone adds an admin controller without the base class, the app won't start.
/// </summary>
public static class AdminRouteGuard
{
    public static void Verify(IServiceProvider services)
    {
        var actions = services.GetRequiredService<IActionDescriptorCollectionProvider>().ActionDescriptors.Items;
        var open = actions
            .Where(a => a.AttributeRouteInfo?.Template?.StartsWith("api/admin", StringComparison.OrdinalIgnoreCase) == true)
            .Where(a => !a.EndpointMetadata.OfType<IAuthorizeData>().Any() || a.EndpointMetadata.OfType<IAllowAnonymous>().Any())
            .Select(a => a.DisplayName)
            .ToList();
        if (open.Count > 0)
            throw new InvalidOperationException("Admin endpoints without [Authorize]: " + string.Join(", ", open));
    }
}
