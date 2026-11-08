namespace Muni_Bouwer.Entities.Models;

public class StudentAttendance
{
    public int Id { get; set; }
    public int StudentActivityId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }
    public int? InstructorId { get; set; }
    public Instructor? Instructor { get; set; }

    public StudentActivity StudentActivity { get; set; } = null!;
}
