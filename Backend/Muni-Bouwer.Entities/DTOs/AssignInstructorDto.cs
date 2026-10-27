using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class AssignInstructorDto
{
    [Range(1, int.MaxValue)]
    public int InstructorId { get; set; }

    [Range(1, int.MaxValue)]
    public int ActivityId { get; set; }
}
