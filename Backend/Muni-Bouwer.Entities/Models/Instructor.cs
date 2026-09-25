namespace Muni_Bouwer.Entities.Models;

public class Instructor : User
{
    public string Specialty { get; set; } = string.Empty;
    public List<InstructorActivity> InstructorActivities { get; set; } = new();
}
