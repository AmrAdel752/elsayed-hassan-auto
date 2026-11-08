using ElSayedHassan.Api.Entities;

namespace ElSayedHassan.Api.Dtos;

/// <summary>Same shape as the frontend <c>Tr { ar, en }</c>.</summary>
public record TrDto(string Ar, string En)
{
    public static TrDto From(Tr t) => new(t.Ar, t.En);
    public Tr ToEntity() => new(Ar, En);
}
