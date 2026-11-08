namespace Muni_Bouwer.Entities.Models;

public class EmergencyContact
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public Student Student { get; set; } = null!;
}
