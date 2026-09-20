namespace Muni_Bouwer.Entities.Models;

public class AlumnoActividad
{
    public int Id { get; set; }
    public int IdAlumno { get; set; }
    public int IdActividad { get; set; }

    public Alumno Alumno { get; set; } = null!;
    public Actividad Actividad { get; set; } = null!;
    public List<Inscripcion> Inscripciones { get; set; } = new();
    public List<AsistenciaAlumno> Asistencias { get; set; } = new();
}
