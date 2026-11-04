using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PermissionNames.UsersManage)]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(UserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserResponseDto>>> GetAll()
    {
        try
        {
            List<UserResponseDto> users = await _userService.GetAllAsync();

            return Ok(users);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener los usuarios.");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener los usuarios."
                });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserResponseDto>> GetById(int id)
    {
        try
        {
            UserResponseDto? user = await _userService.GetByIdAsync(id);

            if (user is null)
            {
                return NotFound(new
                {
                    message = "El usuario solicitado no existe."
                });
            }

            return Ok(user);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener el usuario {UserId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener el usuario."
                });
        }
    }

    [HttpPatch("{id:int}/activate")]
    public async Task<ActionResult<UserResponseDto>> Activate(int id)
    {
        try
        {
            UserOperationResultDto result =
                await _userService.ActivateAsync(id);

            if (result.Status == UserOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El usuario solicitado no existe."
                });
            }

            return Ok(result.User);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al activar el usuario {UserId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al activar el usuario."
                });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            string? currentUserIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(currentUserIdValue, out int currentUserId))
            {
                return Unauthorized(new
                {
                    message = "No se pudo identificar al usuario autenticado."
                });
            }

            UserOperationResultDto result =
                await _userService.DeactivateAsync(id, currentUserId);

            if (result.Status == UserOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El usuario solicitado no existe."
                });
            }

            if (result.Status ==
                UserOperationStatus.CannotDeactivateCurrentUser)
            {
                return Conflict(new
                {
                    message = "No podés desactivar tu propia cuenta."
                });
            }

            return NoContent();
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al desactivar el usuario {UserId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al desactivar el usuario."
                });
        }
    }

    [HttpPut("{id:int}/roles")]
    public async Task<ActionResult<UserResponseDto>> UpdateRoles(
    int id,
    UpdateUserRolesDto request)
    {
        try
        {
            string? currentUserIdValue =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(currentUserIdValue, out int currentUserId))
            {
                return Unauthorized(new
                {
                    message = "No se pudo identificar al usuario autenticado."
                });
            }

            UserOperationResultDto result =
                await _userService.UpdateRolesAsync(
                    id,
                    currentUserId,
                    request);

            if (result.Status == UserOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El usuario solicitado no existe."
                });
            }

            if (result.Status == UserOperationStatus.InvalidRoles)
            {
                return BadRequest(new
                {
                    message = "Uno o más roles no existen o están inactivos."
                });
            }

            if (result.Status ==
                UserOperationStatus.CannotModifyCurrentUserRoles)
            {
                return Conflict(new
                {
                    message = "No podés modificar los roles de tu propia cuenta."
                });
            }

            if (result.Status == UserOperationStatus.IncompatibleRoles)
            {
                return BadRequest(new
                {
                    message = "El rol seleccionado no corresponde al tipo de usuario."
                });
            }

            return Ok(result.User);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al actualizar los roles del usuario {UserId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al actualizar los roles del usuario."
                });
        }
    }
}
