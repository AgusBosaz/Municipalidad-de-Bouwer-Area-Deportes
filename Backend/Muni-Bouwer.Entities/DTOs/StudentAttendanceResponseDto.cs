namespace Muni_Bouwer.Entities.DTOs;

public class StudentAttendanceResponseDto
{
    public int Id { get; set; }
    public int StudentActivityId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }
}