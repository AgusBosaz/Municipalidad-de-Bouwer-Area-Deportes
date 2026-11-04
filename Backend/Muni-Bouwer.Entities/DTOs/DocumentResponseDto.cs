namespace Muni_Bouwer.Entities.DTOs;

public class DocumentResponseDto
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateOnly UploadedAt { get; set; }
}
