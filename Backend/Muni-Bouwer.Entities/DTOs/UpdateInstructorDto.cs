using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class UpdateInstructorDto
{
    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, StringLength(20)]
    public string Dni { get; set; } = string.Empty;

    [Required, StringLength(30)]
    public string Gender { get; set; } = string.Empty;

    [Required, StringLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required, StringLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    public DateOnly BirthDate { get; set; }

    [Required, StringLength(100)]
    public string Specialty { get; set; } = string.Empty;
}
