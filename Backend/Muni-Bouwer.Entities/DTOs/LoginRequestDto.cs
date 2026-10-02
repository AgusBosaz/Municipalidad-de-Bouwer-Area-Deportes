using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class LoginRequestDto
{
    [Required]
    public string Dni { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
