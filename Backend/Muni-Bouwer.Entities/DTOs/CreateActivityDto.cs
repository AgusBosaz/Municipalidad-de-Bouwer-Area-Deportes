namespace Muni_Bouwer.Entities.DTOs;

using System.ComponentModel.DataAnnotations;
using Muni_Bouwer.Entities.Models;

public class CreateActivityDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría de edad es obligatoria.")]
    public AgeCategory Category { get; set; }

    [Required(ErrorMessage = "El horario de inicio es obligatorio.")]
    public TimeOnly StartTime { get; set; }

    [Required(ErrorMessage = "El horario de fin es obligatorio.")]
    public TimeOnly EndTime { get; set; }

    [Range(1, 500, ErrorMessage = "La capacidad máxima debe ser de al menos 1 persona.")]
    public int MaximumCapacity { get; set; }
}