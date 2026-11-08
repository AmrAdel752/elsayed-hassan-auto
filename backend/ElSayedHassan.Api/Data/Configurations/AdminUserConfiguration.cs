using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class AdminUserConfiguration : IEntityTypeConfiguration<AdminUser>
{
    public void Configure(EntityTypeBuilder<AdminUser> b)
    {
        // user names are stored lower-case, so a plain unique index is enough
        b.Property(x => x.UserName).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.UserName).IsUnique();

        b.Property(x => x.DisplayName).HasMaxLength(100).IsRequired();
        b.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
        b.Property(x => x.Role).HasConversion<string>().HasMaxLength(20);
    }
}
