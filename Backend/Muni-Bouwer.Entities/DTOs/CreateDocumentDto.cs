using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class CreateDocumentDto
{
    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string FileUrl { get; set; } = string.Empty;
}
