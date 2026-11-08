using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace ElSayedHassan.Api.Entities;

/// <summary>Arabic + English text, stored as two columns on the owner table (e.g. Name_Ar, Name_En).</summary>
[Owned]
public class Tr
{
    [MaxLength(2000)] public string Ar { get; set; } = "";
    [MaxLength(2000)] public string En { get; set; } = "";

    public Tr() { }
    public Tr(string ar, string en) { Ar = ar; En = en; }
}
