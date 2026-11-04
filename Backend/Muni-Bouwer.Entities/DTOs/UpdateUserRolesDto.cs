using System.ComponentModel.DataAnnotations;

namespace Muni_Bouwer.Entities.DTOs;

public class UpdateUserRolesDto
{
    [Required]
    public List<int> RoleIds { get; set; } = new();
}