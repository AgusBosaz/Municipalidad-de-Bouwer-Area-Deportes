
using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class StudentUpdateDTO : IValidatableObject
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(100, ErrorMessage = "El apellido no puede superar los 100 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El DNI es obligatorio.")]
    [StringLength(20, MinimumLength = 7, ErrorMessage = "El DNI debe tener entre 7 y 20 caracteres.")]
    public string Dni { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "El email no tiene un formato válido.")]
    [StringLength(254, ErrorMessage = "El email no puede superar los 254 caracteres.")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "El género es obligatorio.")]
    [StringLength(30, ErrorMessage = "El género no puede superar los 30 caracteres.")]
    public string Gender { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono es obligatorio.")]
    [StringLength(30, ErrorMessage = "El teléfono no puede superar los 30 caracteres.")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "La dirección es obligatoria.")]
    [StringLength(200, ErrorMessage = "La dirección no puede superar los 200 caracteres.")]
    public string Address { get; set; } = string.Empty;

    public DateOnly BirthDate { get; set; }

    [Required(ErrorMessage = "El nombre del contacto de emergencia es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre del contacto no puede superar los 100 caracteres.")]
    public string EmergencyContactName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El teléfono del contacto de emergencia es obligatorio.")]
    [StringLength(30, ErrorMessage = "El teléfono del contacto no puede superar los 30 caracteres.")]
    public string EmergencyContactPhoneNumber { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (BirthDate == default)
        {
            yield return new ValidationResult(
                "La fecha de nacimiento es obligatoria.",
                new[] { nameof(BirthDate) });
        }
        else if (BirthDate > DateOnly.FromDateTime(DateTime.Today))
        {
            yield return new ValidationResult(
                "La fecha de nacimiento no puede ser futura.",
                new[] { nameof(BirthDate) });
        }
    }
}
