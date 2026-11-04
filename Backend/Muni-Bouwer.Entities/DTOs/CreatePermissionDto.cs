using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class CreatePermissionDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}