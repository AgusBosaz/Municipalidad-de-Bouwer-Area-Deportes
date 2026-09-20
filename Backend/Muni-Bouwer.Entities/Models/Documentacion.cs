namespace Muni_Bouwer.Entities.Models;

public class Documentacion
{
    public int Id { get; set; }
    public int IdAlumno { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string ArchivoUrl { get; set; } = string.Empty;
    public DateOnly FechaCarga { get; set; }

    public Alumno Alumno { get; set; } = null!;
}
