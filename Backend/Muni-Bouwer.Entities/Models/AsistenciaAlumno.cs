namespace Muni_Bouwer.Entities.Models;

public class AsistenciaAlumno
{
    public int Id { get; set; }
    public int IdAlumnoActividad { get; set; }
    public DateOnly Fecha { get; set; }
    public bool Presente { get; set; }

    public AlumnoActividad AlumnoActividad { get; set; } = null!;
}
