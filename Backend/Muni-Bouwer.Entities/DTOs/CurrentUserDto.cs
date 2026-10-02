namespace Muni_Bouwer.Entities.DTOs;

public class CurrentUserDto
{
    public int UserId { get; set; }
    public string FullName { get; set; } = string.Empty;

    public string Dni { get; set; } = string.Empty;

    public List<string> Roles { get; set; } = new();

}