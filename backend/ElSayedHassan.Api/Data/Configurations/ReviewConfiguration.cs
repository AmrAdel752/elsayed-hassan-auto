using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ElSayedHassan.Api.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> b)
    {
        b.OwnsOne(x => x.Name, t => { t.Property(p => p.Ar).HasMaxLength(100); t.Property(p => p.En).HasMaxLength(100); });
        b.Navigation(x => x.Name).IsRequired();
        b.OwnsOne(x => x.Text, t => { t.Property(p => p.Ar).HasMaxLength(2000); t.Property(p => p.En).HasMaxLength(2000); });
        b.Navigation(x => x.Text).IsRequired();

        b.Property(x => x.Model).HasMaxLength(50);
        b.Property(x => x.Service).HasMaxLength(60);
        b.HasIndex(x => x.Date);
        b.ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "[Rating] BETWEEN 1 AND 5"));
    }
}
