namespace Muni_Bouwer.Entities.Models;

public class Inscripcion
{
    public int Id { get; set; }
    public int IdAlumnoActividad { get; set; }
    public DateOnly FechaInscripcion { get; set; }
    public string Estado { get; set; } = string.Empty;

    public AlumnoActividad AlumnoActividad { get; set; } = null!;
}
