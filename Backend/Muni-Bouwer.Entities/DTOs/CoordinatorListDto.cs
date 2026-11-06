namespace Muni_Bouwer.Entities.DTOs;

public class CoordinatorListDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string? Email { get; set; }
}
