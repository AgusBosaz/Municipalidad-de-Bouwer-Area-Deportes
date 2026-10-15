namespace Muni_Bouwer.Entities.DTOs;

public class StudentResponseDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhoneNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
