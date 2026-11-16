using System.Text.Json;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// First start only: fills empty content tables from Data/Seed/catalog.json:
/// categories + products + offers (when ALL three are empty) and reviews (when the reviews table is empty).
/// The JSON is generated from the frontend's static data: <c>node scripts/export-seed.mts</c> (in frontend/).
/// After that the dashboard owns the data; the seed never overwrites or re-adds anything.
/// </summary>
public static class CatalogSeeder
{
    private record SeedFile(List<SeedCategory> Categories, List<SeedProduct> Products, List<SeedOffer> Offers, List<SeedReview>? Reviews);
    private record SeedCategory(string Id, string Icon, TrDto Name);
    private record SeedProduct(string Slug, string Cat, string Icon, string Brand, TrDto Name, TrDto Desc, decimal Price,
        decimal? OldPrice, List<string> Models, bool InStock, bool Featured, TrDto? Badge);
    private record SeedOffer(string Id, string Icon, TrDto Title, TrDto Desc, TrDto Discount, decimal? Price, decimal? OldPrice,
        DateTimeOffset EndsAt, string? Service, List<TrDto> Includes);
    private record SeedReview(TrDto Name, string? Model, int? Year, string? Service, int Rating, DateOnly Date, TrDto Text);

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(CatalogSeeder));
        var db = sp.GetRequiredService<AppDbContext>();

        try
        {
            var catalogEmpty = !await db.Categories.AnyAsync() && !await db.Products.AnyAsync() && !await db.Offers.AnyAsync();
            var reviewsEmpty = !await db.Reviews.AnyAsync();
            if (!catalogEmpty && !reviewsEmpty) return;

            var path = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", "catalog.json");
            if (!File.Exists(path)) { log.LogWarning("Seed file not found: {Path}", path); return; }

            await using var stream = File.OpenRead(path);
            var seed = await JsonSerializer.DeserializeAsync<SeedFile>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                       ?? throw new InvalidOperationException("catalog.json is empty.");

            if (catalogEmpty)
            {
                var categories = seed.Categories.Select((c, i) => new Category
                {
                    Slug = c.Id, Icon = c.Icon, Name = c.Name.ToEntity(), SortOrder = i,
                }).ToDictionary(c => c.Slug);

                db.Categories.AddRange(categories.Values);
                db.Products.AddRange(seed.Products.Select((p, i) => new Product
                {
                    Slug = p.Slug, Category = categories[p.Cat], Icon = p.Icon, Brand = p.Brand,
                    Name = p.Name.ToEntity(), Desc = p.Desc.ToEntity(), Price = p.Price, OldPrice = p.OldPrice,
                    Models = p.Models, InStock = p.InStock, Featured = p.Featured,
                    BadgeAr = p.Badge?.Ar, BadgeEn = p.Badge?.En, SortOrder = i,
                }));
                db.Offers.AddRange(seed.Offers.Select((o, i) => new Offer
                {
                    Slug = o.Id, Icon = o.Icon, Title = o.Title.ToEntity(), Desc = o.Desc.ToEntity(), Discount = o.Discount.ToEntity(),
                    Price = o.Price, OldPrice = o.OldPrice, EndsAt = o.EndsAt, Service = o.Service,
                    Includes = o.Includes.Select(t => t.ToEntity()).ToList(), SortOrder = i,
                }));
                await db.SaveChangesAsync();
                log.LogInformation("Catalog seeded: {C} categories, {P} products, {O} offers.",
                    seed.Categories.Count, seed.Products.Count, seed.Offers.Count);
            }

            if (reviewsEmpty && seed.Reviews is { Count: > 0 } reviews)
            {
                db.Reviews.AddRange(reviews.Select(r => new Review
                {
                    Name = r.Name.ToEntity(), Model = r.Model, Year = r.Year, Service = r.Service,
                    Rating = Math.Clamp(r.Rating, 1, 5), Date = r.Date, Text = r.Text.ToEntity(),
                }));
                await db.SaveChangesAsync();
                log.LogInformation("Reviews seeded: {R}.", reviews.Count);
            }
        }
        catch (Exception ex)
        {
            // never block the API (bookings) from starting
            log.LogError(ex, "Seeding content failed.");
        }
    }
}
