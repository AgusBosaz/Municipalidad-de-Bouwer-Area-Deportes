namespace Muni_Bouwer.Entities.Models;

public class DocenteActividad
{
    public int Id { get; set; }
    public int IdDocente { get; set; }
    public int IdActividad { get; set; }

    public Docente Docente { get; set; } = null!;
    public Actividad Actividad { get; set; } = null!;
    public List<AsistenciaDocente> Asistencias { get; set; } = new();
}
