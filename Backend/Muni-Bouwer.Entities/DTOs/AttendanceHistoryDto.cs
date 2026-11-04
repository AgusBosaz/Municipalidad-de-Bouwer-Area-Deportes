namespace Muni_Bouwer.Entities.DTOs;

public class AttendanceHistoryDto
{
    public int AttendanceId { get; set; }
    public int ActivityId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentDni { get; set; } = string.Empty;
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }
}