namespace Muni_Bouwer.Entities.DTOs;

public enum UserOperationStatus
{
    Success,
    NotFound,
    InvalidRoles,
    CannotDeactivateCurrentUser,
    CannotModifyCurrentUserRoles,
    IncompatibleRoles
}

public class UserOperationResultDto
{
    public UserOperationStatus Status { get; set; }
    public UserResponseDto? User { get; set; }
}