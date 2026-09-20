namespace Muni_Bouwer.Entities.Models;

public class FichaMedica
{
    public int Id { get; set; }
    public int IdAlumno { get; set; }
    public string Enfermedades { get; set; } = string.Empty;
    public string Cus { get; set; } = string.Empty;
    public string Observaciones { get; set; } = string.Empty;

    public Alumno Alumno { get; set; } = null!;
}
