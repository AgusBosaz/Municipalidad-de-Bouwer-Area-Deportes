namespace Muni_Bouwer.Entities.DTOs;

public class SaveActivityAttendanceDto
{
    public DateOnly Date { get; set; }
    public List<AttendanceEntryDto> Entries { get; set; } = new();
}

public class AttendanceEntryDto
{
    public int StudentActivityId { get; set; }
    public bool IsPresent { get; set; }
}
