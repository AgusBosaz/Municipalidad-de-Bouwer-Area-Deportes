namespace Muni_Bouwer.Entities.DTOs;

public class AttendanceStudentDto
{
    public int StudentActivityId { get; set; }
    public int StudentId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
}
