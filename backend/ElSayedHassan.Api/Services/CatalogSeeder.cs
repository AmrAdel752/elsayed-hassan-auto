using System.Text.Json;
using ElSayedHassan.Api.Data;
using ElSayedHassan.Api.Dtos;
using ElSayedHassan.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Services;

/// <summary>
/// First start only: fills categories / products / offers from Data/Seed/catalog.json when ALL three tables are empty.
/// The JSON is generated from the frontend's static data: <c>node scripts/export-seed.mts</c> (in frontend/).
/// After that the dashboard owns the data; the seed never overwrites it.
/// </summary>
public static class CatalogSeeder
{
    private record SeedFile(List<SeedCategory> Categories, List<SeedProduct> Products, List<SeedOffer> Offers);
    private record SeedCategory(string Id, string Icon, TrDto Name);
    private record SeedProduct(string Slug, string Cat, string Icon, string Brand, TrDto Name, TrDto Desc, decimal Price,
        decimal? OldPrice, List<string> Models, bool InStock, bool Featured, TrDto? Badge);
    private record SeedOffer(string Id, string Icon, TrDto Title, TrDto Desc, TrDto Discount, decimal? Price, decimal? OldPrice,
        DateTimeOffset EndsAt, string? Service, List<TrDto> Includes);

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var log = sp.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(CatalogSeeder));
        var db = sp.GetRequiredService<AppDbContext>();

        try
        {
            if (await db.Categories.AnyAsync() || await db.Products.AnyAsync() || await db.Offers.AnyAsync()) return;

            var path = Path.Combine(AppContext.BaseDirectory, "Data", "Seed", "catalog.json");
            if (!File.Exists(path)) { log.LogWarning("Catalog seed file not found: {Path}", path); return; }

            await using var stream = File.OpenRead(path);
            var seed = await JsonSerializer.DeserializeAsync<SeedFile>(stream, new JsonSerializerOptions(JsonSerializerDefaults.Web))
                       ?? throw new InvalidOperationException("catalog.json is empty.");

            var categories = seed.Categories.Select((c, i) => new Category
            {
                Slug = c.Id, Icon = c.Icon, Name = c.Name.ToEntity(), SortOrder = i,
            }).ToDictionary(c => c.Slug);

            var products = seed.Products.Select((p, i) => new Product
            {
                Slug = p.Slug, Category = categories[p.Cat], Icon = p.Icon, Brand = p.Brand,
                Name = p.Name.ToEntity(), Desc = p.Desc.ToEntity(), Price = p.Price, OldPrice = p.OldPrice,
                Models = p.Models, InStock = p.InStock, Featured = p.Featured,
                BadgeAr = p.Badge?.Ar, BadgeEn = p.Badge?.En, SortOrder = i,
            });

            var offers = seed.Offers.Select((o, i) => new Offer
            {
                Slug = o.Id, Icon = o.Icon, Title = o.Title.ToEntity(), Desc = o.Desc.ToEntity(), Discount = o.Discount.ToEntity(),
                Price = o.Price, OldPrice = o.OldPrice, EndsAt = o.EndsAt, Service = o.Service,
                Includes = o.Includes.Select(t => t.ToEntity()).ToList(), SortOrder = i,
            });

            db.Categories.AddRange(categories.Values);
            db.Products.AddRange(products);
            db.Offers.AddRange(offers);
            await db.SaveChangesAsync();
            log.LogInformation("Catalog seeded: {C} categories, {P} products, {O} offers.",
                seed.Categories.Count, seed.Products.Count, seed.Offers.Count);
        }
        catch (Exception ex)
        {
            // never block the API (bookings) from starting
            log.LogError(ex, "Seeding the catalog failed.");
        }
    }
}
