namespace Muni_Bouwer.Entities.Models;

public class Docente : Usuario
{
    public string Especialidad { get; set; } = string.Empty;
    public List<DocenteActividad> DocenteActividades { get; set; } = new();
}
