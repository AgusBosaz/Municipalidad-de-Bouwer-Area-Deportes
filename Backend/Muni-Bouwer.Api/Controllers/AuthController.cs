using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly PasswordRecoveryService _passwordRecoveryService;

    public AuthController(AuthService authService, PasswordRecoveryService passwordRecoveryService)
    {
        _authService = authService;
        _passwordRecoveryService = passwordRecoveryService;
    }

    [AllowAnonymous]
    [EnableRateLimiting("password-recovery")]
    [HttpPost("password-reset/request")]
    public async Task<IActionResult> RequestPasswordReset(RequestPasswordResetDto request)
    {
        if (!_passwordRecoveryService.IsConfigured)
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "El recupero de contraseña no está disponible todavía." });

        await _passwordRecoveryService.RequestAsync(request.Email);
        return Accepted(new
        {
            message = "Si el correo corresponde a una cuenta habilitada, recibirás un enlace para restablecer la contraseña."
        });
    }

    [AllowAnonymous]
    [EnableRateLimiting("password-recovery")]
    [HttpPost("password-reset/confirm")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto request)
    {
        bool changed = await _passwordRecoveryService.ResetAsync(
            request.Token, request.Password);

        return changed
            ? NoContent()
            : BadRequest(new { message = "El enlace no es válido o ya venció." });
    }

    [AllowAnonymous]
    [EnableRateLimiting("login")]
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
            FullName = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty,
            Dni = User.FindFirstValue("dni") ?? string.Empty,
            Roles = User.FindAll(ClaimTypes.Role)
                .Select(claim => claim.Value)
                .ToList(),
            Permissions = User.FindAll("permission")
                .Select(claim => claim.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(permission => permission)
                .ToList()
        };

        return Ok(currentUser);
    }
}
