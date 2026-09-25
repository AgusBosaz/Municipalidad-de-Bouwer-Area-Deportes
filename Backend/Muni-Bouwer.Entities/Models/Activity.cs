namespace Muni_Bouwer.Entities.Models;

public class Activity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public AgeCategory Category { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int MaximumCapacity { get; set; }

    public List<InstructorActivity> InstructorActivities { get; set; } = new();
    public List<StudentActivity> StudentActivities { get; set; } = new();
}
