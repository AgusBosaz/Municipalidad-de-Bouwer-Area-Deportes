using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        LoginResultDto result = await _authService.LoginAsync(request);

        return result.Status switch
        {
            LoginResultStatus.Success =>
                Ok(result.Response),

            LoginResultStatus.InvalidCredentials =>
                Unauthorized(new
                {
                    message = "DNI o contraseña incorrectos."
                }),

            LoginResultStatus.InactiveUser =>
                StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = "El usuario está inactivo."
                    }),

            _ => StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error inesperado."
                })
        };
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<CurrentUserDto> GetCurrentUser()
    {
        string? userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new
            {
                message = "El token no contiene un usuario válido."
            });
        }

        CurrentUserDto currentUser = new()
        {
            UserId = userId,
            FullName = User.FindFirstValue(ClaimTypes.Name)
                ?? string.Empty,
            Dni = User.FindFirstValue("dni")
                ?? string.Empty,
            Roles = User.FindAll(ClaimTypes.Role)
                .Select(claim => claim.Value)
                .Distinct()
                .ToList()
        };

        return Ok(currentUser);
    }
}
