using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly StudentService _studentService;

    public StudentsController(StudentService studentService)
    {
        _studentService = studentService;
    }

    [Authorize(Policy = PermissionNames.StudentsRead)]
    [HttpGet]
    public async Task<ActionResult<List<StudentResponseDto>>> GetAll()
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        var students = await _studentService.GetAllAsync(instructorId);

        return Ok(students);
    }

    [Authorize(Policy = PermissionNames.StudentsRead)]
    [HttpGet("{id}")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        if (!TryGetInstructorScope(out int? instructorId))
            return Forbid();

        var student = await _studentService.GetByIdAsync(id, instructorId);

        if (student == null)
        {
            return NotFound();
        }

        return Ok(student);
    }

    [Authorize(Policy = PermissionNames.StudentsManage)]
    [HttpPost]
    public async Task<ActionResult<StudentResponseDto>> Create(StudentCreateDTO data)
    {
        var student = await _studentService.CreateAsync(data);

        if (student is null)
        {
            return Conflict(new { message = "Ya existe un usuario con ese DNI." });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = student.Id },
            student
        );
    }

    [Authorize(Policy = PermissionNames.StudentsManage)]
    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, StudentUpdateDTO data)
    {
        bool updated;
        try
        {
            updated = await _studentService.UpdateAsync(id, data);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
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
}
