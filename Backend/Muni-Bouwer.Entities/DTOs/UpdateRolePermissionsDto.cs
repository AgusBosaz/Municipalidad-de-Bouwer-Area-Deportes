using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class UpdateRolePermissionsDto
{
    [Required]
    public List<int> PermissionIds { get; set; } = new();
}