namespace Muni_Bouwer.Entities.Models;

public abstract class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Apellido { get; set; } = string.Empty;
    public string Dni { get; set; } = string.Empty;
    public string Genero { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string Domicilio { get; set; } = string.Empty;
    public DateOnly FechaNacimiento { get; set; }
    public DateOnly FechaAlta { get; set; }
    public DateOnly FechaModificacion { get; set; }
    public bool Estado { get; set; }
    public string? PasswordHash { get; set; }

    public List<Rol> Roles { get; set; } = new();
}
