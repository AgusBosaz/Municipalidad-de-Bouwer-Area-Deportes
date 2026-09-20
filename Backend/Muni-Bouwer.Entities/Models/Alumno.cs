namespace Muni_Bouwer.Entities.Models;

public class Alumno : Usuario
{
    public string NombreContactoEmergencia { get; set; } = string.Empty;
    public string TelContactoEmergencia { get; set; } = string.Empty;

    public List<Documentacion> Documentaciones { get; set; } = new();
    public FichaMedica? FichaMedica { get; set; }
    public List<AlumnoActividad> AlumnoActividades { get; set; } = new();
}
