using System.Text;
using System.Text.RegularExpressions;

namespace ElSayedHassan.Api.Services;

public static partial class EgyptPhone
{
    [GeneratedRegex(@"^01[0125][0-9]{8}$")]
    private static partial Regex Mobile();

    /// <summary>Returns the phone as 01xxxxxxxxx, or null if it isn't a valid Egyptian mobile.</summary>
    public static string? Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return null;
        var sb = new StringBuilder(input.Length);
        foreach (var c in input)
        {
            if (c is >= '0' and <= '9') sb.Append(c);
            else if (c is >= '٠' and <= '٩') sb.Append((char)('0' + (c - '٠')));   // Arabic-Indic digits
            else if (c is >= '۰' and <= '۹') sb.Append((char)('0' + (c - '۰')));   // Persian digits
            else if (c is ' ' or '-' or '(' or ')' or '+' or '.') continue;
            else return null;
        }
        var d = sb.ToString();
        if (d.StartsWith("0020")) d = "0" + d[4..];
        else if (d.StartsWith("20") && d.Length == 12) d = "0" + d[2..];
        return Mobile().IsMatch(d) ? d : null;
    }
}
