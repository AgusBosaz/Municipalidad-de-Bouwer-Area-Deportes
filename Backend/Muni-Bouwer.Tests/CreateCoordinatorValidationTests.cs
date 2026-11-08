using System.ComponentModel.DataAnnotations;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Tests;

public class CreateCoordinatorValidationTests
{
    private static CreateCoordinatorDto ValidCoordinator() => new()
    {
        FirstName = "Ana", LastName = "Pérez", Dni = "45123882",
        Email = "ana@example.com", Gender = "Otro", PhoneNumber = "3511234567",
        Address = "Calle 123", BirthDate = new DateOnly(1990, 1, 1)
    };

    private static List<ValidationResult> Validate(CreateCoordinatorDto dto)
    {
        var errors = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), errors, true);
        return errors;
    }

    [Fact]
    public void AcceptsCompleteCoordinator() => Assert.Empty(Validate(ValidCoordinator()));

    [Fact]
    public void RejectsMissingName()
    {
        var dto = ValidCoordinator();
        dto.FirstName = " ";
        Assert.Contains(Validate(dto), error => error.MemberNames.Contains(nameof(dto.FirstName)));
    }

    [Fact]
    public void RejectsDniWithPunctuation()
    {
        var dto = ValidCoordinator();
        dto.Dni = "45.123.882";
        Assert.Contains(Validate(dto), error => error.MemberNames.Contains(nameof(dto.Dni)));
    }

    [Fact]
    public void RejectsInvalidEmail()
    {
        var dto = ValidCoordinator();
        dto.Email = "correo-invalido";
        Assert.Contains(Validate(dto), error => error.MemberNames.Contains(nameof(dto.Email)));
    }

    [Theory]
    [InlineData(0, 0, 0)]
    [InlineData(9999, 1, 1)]
    public void RejectsMissingOrFutureBirthDate(int year, int month, int day)
    {
        var dto = ValidCoordinator();
        dto.BirthDate = year == 0 ? default : new DateOnly(year, month, day);
        Assert.Contains(Validate(dto), error => error.MemberNames.Contains(nameof(dto.BirthDate)));
    }
}
