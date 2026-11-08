using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampCreatedAt();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken ct = default)
    {
        StampCreatedAt();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, ct);
    }

    private void StampCreatedAt()
    {
        var now = DateTime.UtcNow;
        foreach (var e in ChangeTracker.Entries<BaseEntity>())
            if (e.State == EntityState.Added && e.Entity.CreatedAt == default)
                e.Entity.CreatedAt = now;
    }
}
