using System.ComponentModel.DataAnnotations;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Entities.DTOs;

public class ValidActivityDaysAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(
        object? value,
        ValidationContext validationContext)
    {
        if (value is ActivityDays days &&
            (int)days > 0 &&
            ((int)days & ~127) == 0)
        {
            return ValidationResult.Success;
        }

        return new ValidationResult(
            "Seleccioná al menos un día válido."
        );
    }
}