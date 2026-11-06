namespace Muni_Bouwer.Entities.Models;

public class MedicalRecordPdf
{
    public int StudentId { get; set; }
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public Student Student { get; set; } = null!;
}
