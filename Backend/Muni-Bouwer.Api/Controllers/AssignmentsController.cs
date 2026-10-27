using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentsController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [Authorize(Policy = PermissionNames.ActivitiesRead)]
    [HttpGet]
    public async Task<ActionResult<List<AssignmentResponseDto>>> GetAll([FromQuery] int? instructorId)
    {
        return Ok(await _assignmentService.GetAllAsync(instructorId));
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet("mine")]
    public async Task<ActionResult<List<AssignmentResponseDto>>> GetMine()
    {
        if (!User.IsInRole(RoleNames.Instructor) ||
            !int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int instructorId))
            return Forbid();

        return Ok(await _assignmentService.GetAllAsync(instructorId));
    }

    [Authorize(Policy = PermissionNames.ActivitiesManage)]
    [HttpPost]
    public async Task<IActionResult> Assign(AssignInstructorDto dto)
    {
        var (error, result) = await _assignmentService.AssignAsync(dto);

        return error switch
        {
            "instructor_notfound" => NotFound(new { message = "Docente no encontrado." }),
            "activity_notfound" => NotFound(new { message = "Actividad no encontrada." }),
            "duplicate" => Conflict(new { message = "El docente ya está asignado a esa actividad." }),
            _ => StatusCode(StatusCodes.Status201Created, result)
        };
    }

    [Authorize(Policy = PermissionNames.ActivitiesManage)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Unassign(int id)
    {
        var deleted = await _assignmentService.UnassignAsync(id);
        if (!deleted)
            return NotFound(new { message = "Asignación no encontrada." });

        return NoContent();
    }
}
