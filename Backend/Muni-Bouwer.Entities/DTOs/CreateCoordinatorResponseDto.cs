namespace Muni_Bouwer.Entities.DTOs;

public class CreateCoordinatorResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string TemporaryPassword { get; set; } = string.Empty;
}
