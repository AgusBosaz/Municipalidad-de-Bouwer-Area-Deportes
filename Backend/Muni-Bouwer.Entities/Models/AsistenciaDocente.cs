namespace Muni_Bouwer.Entities.Models;

public class AsistenciaDocente
{
    public int Id { get; set; }
    public int IdDocenteActividad { get; set; }
    public DateOnly Fecha { get; set; }
    public bool Presente { get; set; }

    public DocenteActividad DocenteActividad { get; set; } = null!;
}
