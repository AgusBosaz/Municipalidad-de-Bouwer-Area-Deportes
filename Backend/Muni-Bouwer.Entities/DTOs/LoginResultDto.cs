namespace Muni_Bouwer.Entities.DTOs;

public enum LoginResultStatus
{
    Success,
    InvalidCredentials,
    InactiveUser
}

public class LoginResultDto
{
    public LoginResultStatus Status { get; set; }
    public LoginResponseDto? Response { get; set; }
}