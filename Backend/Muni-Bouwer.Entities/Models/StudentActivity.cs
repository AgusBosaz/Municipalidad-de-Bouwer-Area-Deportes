namespace Muni_Bouwer.Entities.Models;

public class StudentActivity
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public int ActivityId { get; set; }

    public Student Student { get; set; } = null!;
    public Activity Activity { get; set; } = null!;
    public List<Enrollment> Enrollments { get; set; } = new();
    public List<StudentAttendance> Attendances { get; set; } = new();
}
