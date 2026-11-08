namespace ElSayedHassan.Api.Entities;

public enum AdminRole
{
    /// <summary>Full access, incl. settings and users.</summary>
    Owner,
    /// <summary>Day-to-day work: bookings, products, offers.</summary>
    Staff,
}

/// <summary>Dashboard login (/admin). Passwords are stored hashed (ASP.NET Core Identity PasswordHasher, PBKDF2).</summary>
public class AdminUser : BaseEntity
{
    public string UserName { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public AdminRole Role { get; set; } = AdminRole.Staff;
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }
}
