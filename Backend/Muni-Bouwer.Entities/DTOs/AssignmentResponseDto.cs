using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Entities.DTOs;

public class AssignmentResponseDto
{
    public int Id { get; set; }
    public int InstructorId { get; set; }
    public string InstructorName { get; set; } = string.Empty;
    public int ActivityId { get; set; }
    public string ActivityName { get; set; } = string.Empty;
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public ActivityDays Days { get; set; }
    public List<string> Warnings { get; set; } = new();
}
