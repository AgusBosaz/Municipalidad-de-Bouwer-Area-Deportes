using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PermissionNames.RolesManage)]
public class PermissionsController : ControllerBase
{
    private readonly PermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(PermissionService permissionService,
            ILogger<PermissionsController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<PermissionResponseDto>>> GetAll()
    {
        try
        {
            List<PermissionResponseDto> permissions =
                await _permissionService.GetAllAsync();

            return Ok(permissions);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener los permisos.");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener los permisos."
                });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PermissionResponseDto>> GetById(int id)
    {
        try
        {
            PermissionResponseDto? permission =
                await _permissionService.GetByIdAsync(id);

            if (permission is null)
            {
                return NotFound(new
                {
                    message = "El permiso solicitado no existe."
                });
            }

            return Ok(permission);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener el permiso {PermissionId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener el permiso."
                });
        }
    }

    [HttpGet("inactive")]
    public async Task<ActionResult<List<PermissionResponseDto>>> GetInactive()
    {
        try
        {
            List<PermissionResponseDto> permissions =
                await _permissionService.GetInactiveAsync();

            return Ok(permissions);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener los permisos inactivos.");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener los permisos inactivos."
                });
        }
    }

    [HttpPost]
    public async Task<ActionResult<PermissionResponseDto>> Create(
    CreatePermissionDto request)
    {
        try
        {
            PermissionOperationResultDto result =
                await _permissionService.CreateAsync(request);

            if (result.Status ==
                PermissionOperationStatus.DuplicateName)
            {
                return Conflict(new
                {
                    message = "Ya existe un permiso con ese nombre."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Permission!.Id },
                result.Permission);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al crear el permiso {PermissionName}.",
                request.Name);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al crear el permiso."
                });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<PermissionResponseDto>> Update(
    int id,
    UpdatePermissionDto request)
    {
        try
        {
            PermissionOperationResultDto result =
                await _permissionService.UpdateAsync(id, request);

            if (result.Status == PermissionOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El permiso solicitado no existe."
                });
            }

            if (result.Status ==
                PermissionOperationStatus.DuplicateName)
            {
                return Conflict(new
                {
                    message = "Ya existe un permiso con ese nombre."
                });
            }

            return Ok(result.Permission);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al actualizar el permiso {PermissionId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al actualizar el permiso."
                });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        try
        {
            PermissionOperationResultDto result =
                await _permissionService.DeactivateAsync(id);

            if (result.Status == PermissionOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El permiso solicitado no existe."
                });
            }

            if (result.Status ==
                PermissionOperationStatus.PermissionInUse)
            {
                return Conflict(new
                {
                    message = "No se puede desactivar el permiso porque está asignado a uno o más roles."
                });
            }

            return NoContent();
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al desactivar el permiso {PermissionId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al desactivar el permiso."
                });
        }
    }

    [HttpPatch("{id:int}/activate")]
    public async Task<ActionResult<PermissionResponseDto>> Reactivate(int id)
    {
        try
        {
            PermissionOperationResultDto result =
                await _permissionService.ReactivateAsync(id);

            if (result.Status == PermissionOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El permiso solicitado no existe."
                });
            }

            return Ok(result.Permission);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al reactivar el permiso {PermissionId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al reactivar el permiso."
                });
        }
    }
}