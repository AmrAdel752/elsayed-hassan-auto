using System.Text.Json.Serialization;
using ElSayedHassan.Api.Controllers.Admin;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Entities;
using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("Missing connection string 'Default'.")));

// CORS: allowed origins come from config ("Cors:Origins"), so production can override via env vars.
const string CorsPolicy = "frontend";
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
var isDev = builder.Environment.IsDevelopment();
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    // dev: any http://localhost:<port> (ng serve may pick 4201, 4202, ...)
    .SetIsOriginAllowed(origin => corsOrigins.Contains(origin) ||
        (isDev && Uri.TryCreate(origin, UriKind.Absolute, out var u) && u.Host == "localhost"))
    .AllowAnyHeader()
    .AllowAnyMethod()));

// RFC 7807 ProblemDetails for all errors (400/404/409/500 ...).
builder.Services.AddProblemDetails();

builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("db");

// Bookings / slots
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<CairoClock>();
builder.Services.AddScoped<SlotService>();
builder.Services.AddScoped<BookingService>();
builder.Services.AddAppRateLimits(builder.Configuration);

// Admin auth: hashed passwords + JWT (Jwt:Key from user-secrets / env var)
builder.Services.AddSingleton<IPasswordHasher<AdminUser>, PasswordHasher<AdminUser>>();
builder.Services.AddAppJwt(builder.Configuration);
builder.Services.AddAdminPolicies();   // [Authorize] on /api/admin/* via AdminControllerBase

builder.Services.AddUploads(builder.Configuration);   // product / offer images, served from /uploads
builder.Services.AddSiteRebuild();   // rebuild the website (Cloudflare deploy hook) after dashboard content changes
builder.Services.AddBookingNotifier();   // email the owner about new bookings (Notify:* settings; off when not set)

builder.Services.AddRouting(o => o.LowercaseUrls = true);   // /api/admin/me, not /api/admin/Me
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));   // "Confirmed", not 1
builder.Services.AddOpenApi(o => o.AddBearerAuth());

var app = builder.Build();

app.UseExceptionHandler();   // unhandled exceptions -> ProblemDetails (no stack trace in production)
app.UseStatusCodePages();    // empty 4xx/5xx responses -> ProblemDetails

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                 // /openapi/v1.json
    app.MapScalarApiReference(o => o  // /scalar  (Auth box: paste the token from POST /api/auth/login)
        .WithTitle("El Sayed Hassan Auto API")
        .AddPreferredSecuritySchemes(OpenApiBearer.Scheme));
}

app.UseHttpsRedirection();
app.UseUploads();
app.UseCors(CorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.UseSiteRebuild();

app.MapHealthChecks("/health");
app.MapContentVersion();   // GET /api/version: open website pages reload their data when it changes
app.MapControllers();

AdminRouteGuard.Verify(app.Services);   // refuse to start if any /api/admin action is not protected
await AdminSeeder.SeedOwnerAsync(app.Services);
await CatalogSeeder.SeedAsync(app.Services);            // first start only (empty catalog tables)

app.Run();
