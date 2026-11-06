using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class CreateCoordinatorDto : IValidatableObject
{
    [Required, StringLength(100)] public string FirstName { get; set; } = string.Empty;
    [Required, StringLength(100)] public string LastName { get; set; } = string.Empty;
    [Required, StringLength(20, MinimumLength = 7), RegularExpression(@"^[0-9]+$")]
    public string Dni { get; set; } = string.Empty;
    [Required, EmailAddress, StringLength(254)] public string Email { get; set; } = string.Empty;
    [Required, StringLength(30)] public string Gender { get; set; } = string.Empty;
    [Required, StringLength(30)] public string PhoneNumber { get; set; } = string.Empty;
    [Required, StringLength(200)] public string Address { get; set; } = string.Empty;
    public DateOnly BirthDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (BirthDate == default || BirthDate > DateOnly.FromDateTime(DateTime.Today))
            yield return new ValidationResult("Ingresá una fecha de nacimiento válida.", new[] { nameof(BirthDate) });
    }
}
