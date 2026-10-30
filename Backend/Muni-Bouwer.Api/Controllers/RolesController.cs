using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PermissionNames.RolesManage)]
public class RolesController : ControllerBase
{
    private readonly RoleService _roleService;
    private readonly ILogger<RolesController> _logger;

    public RolesController(RoleService roleService, ILogger<RolesController> logger)
    {
        _roleService = roleService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoleResponseDto>>> GetAll()
    {

        try
        {
            List<RoleResponseDto> roles = await _roleService.GetAllAsync();

            return Ok(roles);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener los roles."
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener los roles."
                });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoleResponseDto>> GetById(int id)
    {

        try
        {

            RoleResponseDto? role = await _roleService.GetByIdAsync(id);

            if (role is null)
            {
                return NotFound(new
                {
                    message = "El rol solicitado no existe."
                });
            }

            return Ok(role);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener el rol {RoleId}.", id
            );

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener el rol."
                });
        }
    }

    [HttpPost]
    public async Task<ActionResult<RoleResponseDto>> Create(CreateRoleDto request)
    {
        try
        {
            RoleOperationResultDto result = await _roleService.CreateAsync(request);

            if (result.Status == RoleOperationStatus.DuplicateName)
            {
                return Conflict(new
                {
                    message = "Ya existe un rol con ese nombre."
                });
            }

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Role!.Id },
                result.Role);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al crear el rol {RoleName}.", request.Name
            );
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al crear el rol."
                }
            );
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoleResponseDto>> Update(int id, UpdateRoleDto request)
    {
        try
        {
            RoleOperationResultDto result = await _roleService.UpdateAsync(id, request);

            if (result.Status == RoleOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El rol solicitado no existe."
                });
            }

            if (result.Status == RoleOperationStatus.DuplicateName)
            {
                return Conflict(new
                {
                    message = "Ya existe un rol con ese nombre."
                });
            }

            return Ok(result.Role);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al actualizar el rol {RoleId}.", id);

            return StatusCode(StatusCodes.Status500InternalServerError,
            new
            {
                message = "Ocurrió un error al actualizar el rol."
            });
        }

    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            RoleOperationResultDto result = await _roleService.DeleteAsync(id);

            if (result.Status == RoleOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El rol solicitado no existe."
                });
            }

            if (result.Status == RoleOperationStatus.RoleInUse)
            {
                return Conflict(new
                {
                    message = "No se puede desactivar el rol porque tiene usuarios asignados."
                });
            }

            return NoContent();

        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al desactivar el rol {RoleId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al desactivar el rol."
                });
        }
    }

    [HttpPatch("{id:int}/activate")]
    public async Task<ActionResult<RoleResponseDto>> Reactivate(int id)
    {
        try
        {
            RoleOperationResultDto result = await _roleService.ReactivateAsync(id);

            if (result.Status == RoleOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El rol solicitado no existe."
                });
            }

            return Ok(result.Role);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al reactivar el rol {RoleId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al reactivar el rol."
                });
        }
    }

    [HttpGet("inactive")]
    public async Task<ActionResult<List<RoleResponseDto>>> GetInactive()
    {
        try
        {
            List<RoleResponseDto> roles = await _roleService.GetInactiveAsync();

            return Ok(roles);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al obtener los roles inactivos.");

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al obtener los roles inactivos."
                });
        }
    }

    [HttpPut("{id:int}/permissions")]
    public async Task<ActionResult<RoleResponseDto>> UpdatePermissions(
    int id,
    UpdateRolePermissionsDto request)
    {
        try
        {
            RoleOperationResultDto result =
                await _roleService.UpdatePermissionsAsync(id, request);

            if (result.Status == RoleOperationStatus.NotFound)
            {
                return NotFound(new
                {
                    message = "El rol solicitado no existe."
                });
            }

            if (result.Status ==
                RoleOperationStatus.InvalidPermissions)
            {
                return BadRequest(new
                {
                    message = "Uno o más permisos no existen o están inactivos."
                });
            }

            return Ok(result.Role);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "Error al actualizar los permisos del rol {RoleId}.",
                id);

            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Ocurrió un error al actualizar los permisos del rol."
                });
        }
    }
}
