namespace Muni_Bouwer.Entities.Models;

public class Rol
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public List<Usuario> Usuarios { get; set; } = new();
    public List<Permiso> Permisos { get; set; } = new();
}
