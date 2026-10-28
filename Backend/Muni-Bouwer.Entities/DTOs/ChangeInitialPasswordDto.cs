using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class ChangeInitialPasswordDto
{
    [Required, MinLength(8), StringLength(128)]
    public string NewPassword { get; set; } = string.Empty;
}