using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class ResetPasswordDto
{
    [Required, StringLength(200)]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(8), StringLength(128)]
    public string Password { get; set; } = string.Empty;
}
