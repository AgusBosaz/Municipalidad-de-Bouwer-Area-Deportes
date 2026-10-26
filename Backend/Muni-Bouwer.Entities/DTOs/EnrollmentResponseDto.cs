namespace Muni_Bouwer.Entities.DTOs;

public class EnrollmentResponseDto
{
    public int Id { get; set; }
    public int StudentActivityId { get; set; }
    public int StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int ActivityId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public DateOnly EnrollmentDate { get; set; }
}
