namespace Muni_Bouwer.Entities.Models;

public class InstructorAttendance
{
    public int Id { get; set; }
    public int InstructorActivityId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsPresent { get; set; }

    public InstructorActivity InstructorActivity { get; set; } = null!;
}
