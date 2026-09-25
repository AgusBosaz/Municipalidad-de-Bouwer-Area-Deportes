namespace Muni_Bouwer.Entities.Models;

public class MedicalRecord
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Diseases { get; set; } = string.Empty;
    public string Cus { get; set; } = string.Empty;
    public string Observations { get; set; } = string.Empty;

    public Student Student { get; set; } = null!;
}
