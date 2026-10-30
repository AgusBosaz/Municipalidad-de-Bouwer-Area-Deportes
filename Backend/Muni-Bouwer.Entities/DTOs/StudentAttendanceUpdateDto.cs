namespace Muni_Bouwer.Entities.DTOs;

public class StudentAttendanceUpdateDto
{
    public int StudentActivityId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }
}