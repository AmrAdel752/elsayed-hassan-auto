using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// Creates dashboard accounts on startup from config. Passwords come from user-secrets locally and from
/// host env vars in production — never from appsettings.json.
/// <list type="bullet">
/// <item><c>Admin:Owner:UserName / DisplayName / Password</c>: the first owner, created when no Owner exists.</item>
/// <item><c>Admin:Users:0:UserName / DisplayName / Password / Role</c> (0, 1, 2 ...): extra accounts, each created
/// when its user name doesn't exist yet. Role = Owner or Staff (default Staff).</item>
/// </list>
/// An existing account is never changed here: editing a password in config later has no effect on it.
/// </summary>
public static class AdminSeeder
{
    public const int MinPasswordLength = 10;

    public class SeedUser
    {
        public string UserName { get; set; } = "";
        public string? DisplayName { get; set; }
        public string? Password { get; set; }
        public AdminRole Role { get; set; } = AdminRole.Staff;
    }

    public static async Task SeedOwnerAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(AdminSeeder));
        var config = sp.GetRequiredService<IConfiguration>();
        var db = sp.GetRequiredService<AppDbContext>();
        var hasher = sp.GetRequiredService<IPasswordHasher<AdminUser>>();

        try
        {
            var users = config.GetSection("Admin:Users").Get<List<SeedUser>>() ?? [];

            // the first owner (only while there is no owner at all, incl. the ones listed under Admin:Users)
            if (!await db.AdminUsers.AnyAsync(u => u.Role == AdminRole.Owner) && users.All(u => u.Role != AdminRole.Owner))
                users.Insert(0, new SeedUser
                {
                    UserName = config["Admin:Owner:UserName"] ?? "owner",
                    DisplayName = config["Admin:Owner:DisplayName"] ?? "Owner",
                    Password = config["Admin:Owner:Password"],
                    Role = AdminRole.Owner,
                });

            foreach (var u in users)
            {
                var userName = u.UserName.Trim().ToLowerInvariant();
                if (userName.Length == 0 || await db.AdminUsers.AnyAsync(x => x.UserName == userName)) continue;
                if (string.IsNullOrWhiteSpace(u.Password) || u.Password.Length < MinPasswordLength)
                {
                    log.LogWarning("Account '{User}' not created: its password is missing or shorter than {Min} characters.", userName, MinPasswordLength);
                    continue;
                }

                var user = new AdminUser
                {
                    UserName = userName,
                    DisplayName = string.IsNullOrWhiteSpace(u.DisplayName) ? userName : u.DisplayName.Trim(),
                    Role = u.Role,
                };
                user.PasswordHash = hasher.HashPassword(user, u.Password);
                db.AdminUsers.Add(user);
                await db.SaveChangesAsync();
                log.LogInformation("{Role} account '{User}' created.", u.Role, userName);
            }
        }
        catch (Exception ex)
        {
            // don't stop the public API (slots/bookings) from starting because of this
            log.LogError(ex, "Seeding dashboard accounts failed.");
        }
    }
}
