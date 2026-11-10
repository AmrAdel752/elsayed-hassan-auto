using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// Adds the "Bearer" (JWT) security scheme to the OpenAPI doc and marks every [Authorize] operation with it,
/// so Scalar shows a lock + an auth box where you paste the token from POST /api/auth/login.
/// </summary>
public static class OpenApiBearer
{
    public const string Scheme = "Bearer";

    public static OpenApiOptions AddBearerAuth(this OpenApiOptions o)
    {
        o.AddDocumentTransformer((doc, _, _) =>
        {
            doc.Components ??= new OpenApiComponents();
            doc.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
            doc.Components.SecuritySchemes[Scheme] = new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "Paste the token from POST /api/auth/login.",
            };
            return Task.CompletedTask;
        });

        o.AddOperationTransformer((op, ctx, _) =>
        {
            var meta = ctx.Description.ActionDescriptor.EndpointMetadata;
            if (meta.OfType<IAuthorizeData>().Any() && !meta.OfType<IAllowAnonymous>().Any())
            {
                op.Security ??= [];
                op.Security.Add(new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference(Scheme, ctx.Document)] = [],
                });
            }
            return Task.CompletedTask;
        });
        return o;
    }
}
