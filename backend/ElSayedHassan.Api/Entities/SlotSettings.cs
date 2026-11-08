namespace ElSayedHassan.Api.Entities;

/// <summary>Single-row table (Id = 1) with the booking slot rules. Editable by the owner later (H5).</summary>
public class SlotSettings : BaseEntity
{
    /// <summary>Max cars per hour slot.</summary>
    public int Capacity { get; set; } = 3;
    /// <summary>First bookable hour (Cairo time), inclusive.</summary>
    public int OpenHour { get; set; } = 10;
    /// <summary>Closing hour (Cairo time), exclusive: last slot starts at CloseHour - 1.</summary>
    public int CloseHour { get; set; } = 22;
    /// <summary>How many days ahead customers can book (today counts as day 0).</summary>
    public int MaxDaysAhead { get; set; } = 30;
}
