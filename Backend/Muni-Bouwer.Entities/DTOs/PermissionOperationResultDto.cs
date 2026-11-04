namespace Muni_Bouwer.Entities.DTOs;

public enum PermissionOperationStatus
{
    Success,
    NotFound,
    DuplicateName,
    PermissionInUse
}

public class PermissionOperationResultDto
{
    public PermissionOperationStatus Status { get; set; }
    public PermissionResponseDto? Permission { get; set; }
}