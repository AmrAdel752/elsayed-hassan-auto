using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class SlotSettingsConfiguration : IEntityTypeConfiguration<SlotSettings>
{
    public void Configure(EntityTypeBuilder<SlotSettings> b)
    {
        b.ToTable(t =>
        {
            t.HasCheckConstraint("CK_SlotSettings_Capacity", "[Capacity] BETWEEN 0 AND 50");
            t.HasCheckConstraint("CK_SlotSettings_Hours", "[OpenHour] >= 0 AND [CloseHour] <= 24 AND [OpenHour] < [CloseHour]");
        });

        // Seed the single settings row: 3 cars/hour, 10:00–22:00, book up to 30 days ahead.
        b.HasData(new SlotSettings
        {
            Id = 1,
            Capacity = 3,
            OpenHour = 10,
            CloseHour = 22,
            MaxDaysAhead = 30,
            CreatedAt = new DateTime(2026, 11, 8, 0, 0, 0, DateTimeKind.Utc),
        });
    }
}

public class ClosedDayConfiguration : IEntityTypeConfiguration<ClosedDay>
{
    public void Configure(EntityTypeBuilder<ClosedDay> b)
    {
        b.HasIndex(x => x.Date).IsUnique();
        b.Property(x => x.Reason).HasMaxLength(200);
    }
}

public class ClosedSlotConfiguration : IEntityTypeConfiguration<ClosedSlot>
{
    public void Configure(EntityTypeBuilder<ClosedSlot> b)
    {
        b.HasIndex(x => new { x.Date, x.Hour }).IsUnique();
        b.Property(x => x.Reason).HasMaxLength(200);
        b.ToTable(t => t.HasCheckConstraint("CK_ClosedSlots_Hour", "[Hour] BETWEEN 0 AND 23"));
    }
}
