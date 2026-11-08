using System.ComponentModel.DataAnnotations;

namespace ElSayedHassan.Api.Dtos;

public record LoginDto
{
    [Required, StringLength(50)]
    public string UserName { get; init; } = "";

    [Required, StringLength(200)]
    public string Password { get; init; } = "";
}

public record AdminUserDto(int Id, string UserName, string DisplayName, string Role);

/// <summary>Send the token as <c>Authorization: Bearer &lt;token&gt;</c>. Valid until <c>ExpiresAt</c> (UTC, 8h).</summary>
public record LoginResultDto(string Token, DateTime ExpiresAt, AdminUserDto User);
