using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
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

    [HttpGet]
    public async Task<ActionResult<List<AssignmentResponseDto>>> GetAll([FromQuery] int? instructorId)
    {
        return Ok(await _assignmentService.GetAllAsync(instructorId));
    }

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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Unassign(int id)
    {
        var deleted = await _assignmentService.UnassignAsync(id);
        if (!deleted)
            return NotFound(new { message = "Asignación no encontrada." });

        return NoContent();
    }
}
