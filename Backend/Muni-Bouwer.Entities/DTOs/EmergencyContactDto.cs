using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class EmergencyContactDto
{
    [Required(ErrorMessage = "El nombre del contacto es obligatorio.")]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono del contacto es obligatorio.")]
    [StringLength(30)]
    public string PhoneNumber { get; set; } = string.Empty;
}
