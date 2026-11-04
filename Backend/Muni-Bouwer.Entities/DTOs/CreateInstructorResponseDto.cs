namespace Muni_Bouwer.Entities.DTOs;

public class CreateInstructorResponseDto
{
    public InstructorResponseDto Instructor { get; set; } = new();
    public string TemporaryPassword { get; set; } = string.Empty;
}