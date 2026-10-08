namespace Muni_Bouwer.Entities.DTOs;

public enum RoleOperationStatus
{
    Success,
    NotFound,
    DuplicateName,
    RoleInUse
}

public class RoleOperationResultDto
{
    public RoleOperationStatus Status { get; set; }
    public RoleResponseDto? Role { get; set; }
}
