using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentAttendanceController : ControllerBase
{
    private readonly StudentAttendanceService _service;

    public StudentAttendanceController(StudentAttendanceService service)
    {
        _service = service;
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet]
    public async Task<ActionResult<List<StudentAttendanceResponseDto>>> GetAll()
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        var attendances = await _service.GetAllAsync(instructorId);
        return Ok(attendances);
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet("history")]
    public async Task<ActionResult<List<AttendanceHistoryDto>>> GetHistory()
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        var history = await _service.GetHistoryAsync(instructorId);
        return Ok(history);
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet("activity/{activityId:int}")]
    public async Task<ActionResult<List<StudentAttendanceResponseDto>>> GetByActivityAndDate(
        int activityId, [FromQuery] DateOnly date)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        if (!await _service.CanAccessActivityAsync(activityId, instructorId))
            return NotFound();

        if (date == default)
            return BadRequest(new { message = "La fecha de asistencia es obligatoria." });

        return Ok(await _service.GetByActivityAndDateAsync(
            activityId, date, instructorId));
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet("activity/{activityId:int}/students")]
    public async Task<ActionResult<List<AttendanceStudentDto>>> GetStudentsByActivity(
        int activityId)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        if (!await _service.CanAccessActivityAsync(activityId, instructorId))
            return NotFound();

        return Ok(await _service.GetStudentsByActivityAsync(activityId));
    }

    [Authorize(Policy = PermissionNames.AttendanceRegister)]
    [HttpPut("activity/{activityId:int}")]
    public async Task<IActionResult> SaveActivityAttendance(
        int activityId, [FromBody] SaveActivityAttendanceDto dto)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        if (!await _service.CanAccessActivityAsync(activityId, instructorId))
            return NotFound();

        if (!IsValidDate(dto.Date))
            return BadRequest(new { message = "La fecha de asistencia no es válida." });

        List<AttendanceStudentDto> students =
            await _service.GetStudentsByActivityAsync(activityId);
        HashSet<int> expectedIds = students
            .Select(student => student.StudentActivityId)
            .ToHashSet();
        if (dto.Entries is null ||
            dto.Entries.Count != expectedIds.Count ||
            !expectedIds.SetEquals(dto.Entries.Select(entry => entry.StudentActivityId)))
            return BadRequest(new { message = "La lista debe incluir una vez a cada alumno inscripto." });

        await _service.SaveActivityAttendanceAsync(dto.Date, dto.Entries);
        return NoContent();
    }

    [Authorize(Policy = PermissionNames.AttendanceRegister)]
    [HttpPost]
    public async Task<ActionResult<StudentAttendanceResponseDto>> Create([FromBody] StudentAttendanceCreateDto dto)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        if (instructorId is int id &&
            !await _service.IsAssignedToStudentActivityAsync(dto.StudentActivityId, id))
            return Forbid();

        if (!await _service.HasActiveEnrollmentAsync(dto.StudentActivityId))
            return BadRequest(new { message = "El alumno no tiene una inscripción activa en esa actividad." });

        if (!IsValidDate(dto.Date))
            return BadRequest(new { message = "La fecha de asistencia no es válida." });

        if (await _service.ExistsForDateAsync(dto.StudentActivityId, dto.Date))
            return Conflict(new { message = "Ya existe asistencia para ese alumno y fecha." });

        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    [Authorize(Policy = PermissionNames.AttendanceRegister)]
    [HttpPut("{id}")]
    public async Task<ActionResult<StudentAttendanceResponseDto>> Update(int id, [FromBody] StudentAttendanceUpdateDto dto)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        var existing = await _service.GetByIdAsync(id);
        if (existing is null)
            return NotFound();

        if (instructorId is int instructor &&
            !await _service.IsAssignedToStudentActivityAsync(existing.StudentActivityId, instructor))
            return Forbid();

        if (existing.StudentActivityId != dto.StudentActivityId)
            return BadRequest(new { message = "No se puede cambiar el alumno de una asistencia existente." });

        if (!await _service.HasActiveEnrollmentAsync(existing.StudentActivityId))
            return BadRequest(new { message = "El alumno no tiene una inscripción activa en esa actividad." });

        if (!IsValidDate(dto.Date))
            return BadRequest(new { message = "La fecha de asistencia no es válida." });

        if (await _service.ExistsForDateAsync(dto.StudentActivityId, dto.Date, id))
            return Conflict(new { message = "Ya existe asistencia para ese alumno y fecha." });

        var result = await _service.UpdateAsync(id, dto);
        if (result == null)
        {
            return NotFound();
        }
        return Ok(result);
    }

    [Authorize(Policy = PermissionNames.AttendanceRead)]
    [HttpGet("instructor/{instructorId}")]
    public async Task<ActionResult<List<StudentAttendanceResponseDto>>> GetByInstructorId(int instructorId)
    {
        if (!TryGetInstructorScope(out int? currentInstructorId) ||
            (currentInstructorId is int id && id != instructorId))
            return Forbid();

        var attendances = await _service.GetByInstructorIdAsync(instructorId);
        return Ok(attendances);
    }

    private bool TryGetInstructorScope(out int? instructorId)
    {
        instructorId = null;
        if (User.IsInRole(RoleNames.Coordinator))
            return true;

        if (!User.IsInRole(RoleNames.Instructor) ||
            !int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int id))
            return false;

        instructorId = id;
        return true;
    }

    private static bool IsValidDate(DateOnly date) =>
        date != default && date <= DateOnly.FromDateTime(DateTime.UtcNow);
}
