using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// Creates the owner account on startup when no Owner exists yet.
/// Reads Admin:Owner:UserName / DisplayName / Password from config — the password comes from
/// user-secrets locally and from a host env var in production (Admin__Owner__Password). Never from appsettings.json.
/// Changing the password in config later does NOT change an existing owner (do that from the dashboard).
/// </summary>
public static class AdminSeeder
{
    public const int MinPasswordLength = 10;

    public static async Task SeedOwnerAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(AdminSeeder));
        var config = sp.GetRequiredService<IConfiguration>();
        var db = sp.GetRequiredService<AppDbContext>();

        try
        {
            if (await db.AdminUsers.AnyAsync(u => u.Role == AdminRole.Owner)) return;

            var userName = (config["Admin:Owner:UserName"] ?? "owner").Trim().ToLowerInvariant();
            var password = config["Admin:Owner:Password"];
            if (string.IsNullOrWhiteSpace(password) || password.Length < MinPasswordLength)
            {
                log.LogWarning("No owner account yet: set Admin:Owner:Password (min {Min} chars) to create it.", MinPasswordLength);
                return;
            }

            var owner = new AdminUser
            {
                UserName = userName,
                DisplayName = config["Admin:Owner:DisplayName"] ?? "Owner",
                Role = AdminRole.Owner,
            };
            owner.PasswordHash = sp.GetRequiredService<IPasswordHasher<AdminUser>>().HashPassword(owner, password);
            db.AdminUsers.Add(owner);
            await db.SaveChangesAsync();
            log.LogInformation("Owner account '{User}' created.", userName);
        }
        catch (Exception ex)
        {
            // don't stop the public API (slots/bookings) from starting because of this
            log.LogError(ex, "Seeding the owner account failed.");
        }
    }
}
