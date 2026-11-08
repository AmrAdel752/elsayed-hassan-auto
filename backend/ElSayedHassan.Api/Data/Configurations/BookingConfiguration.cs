using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class BookingConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> b)
    {
        b.Property(x => x.Code).HasMaxLength(16).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();

        b.Property(x => x.Name).HasMaxLength(100).IsRequired();
        b.Property(x => x.Phone).HasMaxLength(20).IsRequired();
        b.Property(x => x.Model).HasMaxLength(50).IsRequired();
        b.Property(x => x.Generation).HasMaxLength(50);
        b.Property(x => x.Km).HasMaxLength(20);
        b.Property(x => x.Notes).HasMaxLength(1000);
        b.Property(x => x.Services).HasMaxLength(1000);   // JSON array of slugs

        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);

        // Slot capacity checks count bookings per (Date, Hour).
        b.HasIndex(x => new { x.Date, x.Hour });
        b.HasIndex(x => x.Phone);
    }
}
