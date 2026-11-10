using ElSayedHassan.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ElSayedHassan.Api.Controllers.Admin;

public record UploadedDto(string Url);

[Route("api/admin/uploads")]
public class AdminUploadsController(UploadStore store) : AdminControllerBase
{
    /// <summary>
    /// Upload one image (multipart field <c>file</c>; jpg / png / webp, max 5 MB).
    /// Returns its path (<c>/uploads/yyyy/MM/name.ext</c>) to put in a product's or offer's <c>img</c>.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    [ProducesResponseType<UploadedDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        var (error, url) = await store.SaveAsync(file, ct);
        if (error == UploadError.None) return StatusCode(201, new UploadedDto(url!));

        return ValidationProblem(new ValidationProblemDetails(new Dictionary<string, string[]>
        {
            ["file"] = [error switch
            {
                UploadError.Empty => "The file is empty.",
                UploadError.TooLarge => $"The image is larger than {store.Options.MaxBytes / (1024 * 1024)} MB.",
                _ => "Only JPG, PNG or WebP images are allowed.",
            }],
        }));
    }
}
