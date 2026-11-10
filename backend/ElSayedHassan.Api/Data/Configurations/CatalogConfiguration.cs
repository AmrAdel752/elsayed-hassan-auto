using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.Property(x => x.Slug).HasMaxLength(60).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();
        b.Property(x => x.Icon).HasMaxLength(40).IsRequired();
        b.OwnsOne(x => x.Name, t => { t.Property(p => p.Ar).HasMaxLength(100); t.Property(p => p.En).HasMaxLength(100); });
        b.Navigation(x => x.Name).IsRequired();
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();
        b.Property(x => x.Icon).HasMaxLength(40).IsRequired();
        b.Property(x => x.Brand).HasMaxLength(100).IsRequired();

        b.OwnsOne(x => x.Name, t => { t.Property(p => p.Ar).HasMaxLength(200); t.Property(p => p.En).HasMaxLength(200); });
        b.Navigation(x => x.Name).IsRequired();
        b.OwnsOne(x => x.Desc, t => { t.Property(p => p.Ar).HasMaxLength(2000); t.Property(p => p.En).HasMaxLength(2000); });
        b.Navigation(x => x.Desc).IsRequired();

        b.Property(x => x.Price).HasPrecision(10, 2);
        b.Property(x => x.OldPrice).HasPrecision(10, 2);
        b.Property(x => x.Models).HasMaxLength(1000);
        b.Property(x => x.BadgeAr).HasMaxLength(60);
        b.Property(x => x.BadgeEn).HasMaxLength(60);
        b.Property(x => x.ImageUrl).HasMaxLength(300);

        // a category that still has products can't be deleted (the API answers 409)
        b.HasOne(x => x.Category).WithMany(c => c.Products).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        b.ToTable(t => t.HasCheckConstraint("CK_Products_Price", "[Price] >= 0"));
    }
}

public class OfferConfiguration : IEntityTypeConfiguration<Offer>
{
    public void Configure(EntityTypeBuilder<Offer> b)
    {
        b.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        b.HasIndex(x => x.Slug).IsUnique();
        b.Property(x => x.Icon).HasMaxLength(40).IsRequired();

        b.OwnsOne(x => x.Title, t => { t.Property(p => p.Ar).HasMaxLength(200); t.Property(p => p.En).HasMaxLength(200); });
        b.Navigation(x => x.Title).IsRequired();
        b.OwnsOne(x => x.Desc, t => { t.Property(p => p.Ar).HasMaxLength(2000); t.Property(p => p.En).HasMaxLength(2000); });
        b.Navigation(x => x.Desc).IsRequired();
        b.OwnsOne(x => x.Discount, t => { t.Property(p => p.Ar).HasMaxLength(60); t.Property(p => p.En).HasMaxLength(60); });
        b.Navigation(x => x.Discount).IsRequired();

        b.OwnsMany(x => x.Includes, t => t.ToJson());

        b.Property(x => x.Price).HasPrecision(10, 2);
        b.Property(x => x.OldPrice).HasPrecision(10, 2);
        b.Property(x => x.Service).HasMaxLength(60);
        b.Property(x => x.ImageUrl).HasMaxLength(300);
        b.HasIndex(x => x.EndsAt);
    }
}
