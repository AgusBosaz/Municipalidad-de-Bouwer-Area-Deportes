namespace Muni_Bouwer.Entities.Models;

public class Documentation
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateOnly UploadedAt { get; set; }

    public Student Student { get; set; } = null!;
}
