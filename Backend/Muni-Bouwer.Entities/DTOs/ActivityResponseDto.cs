namespace Muni_Bouwer.Entities.DTOs;

using Muni_Bouwer.Entities.Models;

public class ActivityResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public AgeCategory Category { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int MaximumCapacity { get; set; }
    public int EnrolledStudentsCount { get; set; }
}