namespace ElSayedHassan.Api.Entities;

/// <summary>Base for all tables: int key + UTC creation time (set automatically in AppDbContext).</summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; }
}
