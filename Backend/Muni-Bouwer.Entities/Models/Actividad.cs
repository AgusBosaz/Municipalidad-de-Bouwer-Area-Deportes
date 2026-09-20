namespace Muni_Bouwer.Entities.Models;

public class Actividad
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public CategoriaEtaria Categoria { get; set; }
    public TimeOnly HorarioInicio { get; set; }
    public TimeOnly HorarioFin { get; set; }
    public int CupoMaximo { get; set; }

    public List<DocenteActividad> DocenteActividades { get; set; } = new();
    public List<AlumnoActividad> AlumnoActividades { get; set; } = new();
}
