namespace Muni_Bouwer.Entities.Models;

public class Permiso
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;

    public List<Rol> Roles { get; set; } = new();
}
