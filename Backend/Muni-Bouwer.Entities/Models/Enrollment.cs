namespace Muni_Bouwer.Entities.Models;

public class Enrollment
{
    public int Id { get; set; }
    public int StudentActivityId { get; set; }
    public DateOnly EnrollmentDate { get; set; }
    public string Status { get; set; } = string.Empty;

    public StudentActivity StudentActivity { get; set; } = null!;
}
