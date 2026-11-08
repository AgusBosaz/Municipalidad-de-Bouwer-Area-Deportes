using System.ComponentModel.DataAnnotations;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Tests;

public class ValidActivityDaysTests
{
    private readonly ValidActivityDaysAttribute _validacion = new();

    [Theory]
    [InlineData(ActivityDays.Monday)]
    [InlineData(ActivityDays.Monday | ActivityDays.Wednesday)]
    [InlineData(ActivityDays.Saturday | ActivityDays.Sunday)]
    public void AceptaDiasValidos(ActivityDays dias)
    {
        var resultado = _validacion.GetValidationResult(
            dias,
            new ValidationContext(new object())
        );

        Assert.Equal(ValidationResult.Success, resultado);
    }

    [Theory]
    [InlineData(ActivityDays.None)]
    [InlineData((ActivityDays)128)]
    [InlineData((ActivityDays)(-1))]
    public void RechazaDiasInvalidos(ActivityDays dias)
    {
        var resultado = _validacion.GetValidationResult(
            dias,
            new ValidationContext(new object())
        );

        Assert.NotEqual(ValidationResult.Success, resultado);
    }
}