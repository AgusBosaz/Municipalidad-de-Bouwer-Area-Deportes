namespace Muni_Bouwer.Entities.Models;

public abstract class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public DateOnly CreatedAt { get; set; }
    public DateOnly UpdatedAt { get; set; }
    public bool IsActive { get; set; }
    public string? PasswordHash { get; set; }

    public List<Role> Roles { get; set; } = new();
}
