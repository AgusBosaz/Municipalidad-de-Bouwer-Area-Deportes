namespace Muni_Bouwer.Entities.Models;

public class InstructorActivity
{
    public int Id { get; set; }
    public int InstructorId { get; set; }
    public int ActivityId { get; set; }

    public Instructor Instructor { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
    public List<InstructorAttendance> Attendances { get; set; } = new();
}
