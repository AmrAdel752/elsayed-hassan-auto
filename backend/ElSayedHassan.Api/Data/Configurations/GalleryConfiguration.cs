using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class GalleryItemConfiguration : IEntityTypeConfiguration<GalleryItem>
{
    public void Configure(EntityTypeBuilder<GalleryItem> b)
    {
        b.Property(x => x.Category).HasMaxLength(20).IsRequired();
        b.Property(x => x.Icon).HasMaxLength(40).IsRequired();
        b.OwnsOne(x => x.Title, t => { t.Property(p => p.Ar).HasMaxLength(200); t.Property(p => p.En).HasMaxLength(200); });
        b.Navigation(x => x.Title).IsRequired();
        b.Property(x => x.ImageUrl).HasMaxLength(300);
        b.ToTable(t => t.HasCheckConstraint("CK_GalleryItems_Category", "[Category] IN ('workshop', 'work', 'cars')"));
    }
}

public class BeforeAfterConfiguration : IEntityTypeConfiguration<BeforeAfter>
{
    public void Configure(EntityTypeBuilder<BeforeAfter> b)
    {
        b.ToTable("BeforeAfters");
        b.Property(x => x.Icon).HasMaxLength(40).IsRequired();
        b.OwnsOne(x => x.Title, t => { t.Property(p => p.Ar).HasMaxLength(200); t.Property(p => p.En).HasMaxLength(200); });
        b.Navigation(x => x.Title).IsRequired();
        b.OwnsOne(x => x.Desc, t => { t.Property(p => p.Ar).HasMaxLength(1000); t.Property(p => p.En).HasMaxLength(1000); });
        b.Navigation(x => x.Desc).IsRequired();
        b.Property(x => x.BeforeUrl).HasMaxLength(300);
        b.Property(x => x.AfterUrl).HasMaxLength(300);
    }
}
