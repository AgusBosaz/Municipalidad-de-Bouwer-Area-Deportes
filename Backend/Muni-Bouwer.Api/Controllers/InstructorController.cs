using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;
using Microsoft.AspNetCore.Authorization;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructorController : ControllerBase
{
    private readonly InstructorService _instructorsService;

    public InstructorController(InstructorService instructorsService)
    {
        _instructorsService = instructorsService;
    }

    [Authorize(Policy = PermissionNames.InstructorsRead)]
    [HttpGet]
    public async Task<ActionResult<List<InstructorResponseDto>>> GetAll()
    {
        return Ok(await _instructorsService.GetAllAsync());
    }

    [Authorize(Policy = PermissionNames.InstructorsRead)]
    [HttpGet("{id}")]
    public async Task<ActionResult<InstructorResponseDto>> GetById(int id)
    {
        var instructor = await _instructorsService.GetByIdAsync(id);
        if (instructor is null)
            return NotFound(new { message = "Docente no encontrado." });

        return Ok(instructor);
    }

    [Authorize(Policy = PermissionNames.InstructorsManage)]
    [HttpPost("CreateInstructor")]
    public async Task<ActionResult<CreateInstructorResponseDto>> CreateInstructor(CreateInstructorDto dto)
    {
        var created = await _instructorsService.CreateAsync(dto);
        if (created is null)
            return Conflict(new { message = "Ya existe un usuario con ese DNI o email." });

        return StatusCode(StatusCodes.Status201Created, created);
    }

    [Authorize(Policy = PermissionNames.InstructorsManage)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateInstructorDto dto)
    {
        var result = await _instructorsService.UpdateAsync(id, dto);

        return result switch
        {
            "notfound" => NotFound(new { message = "Docente no encontrado." }),
            "duplicate" => Conflict(new { message = "Ya existe un usuario con ese DNI." }),
            "emailduplicate" => Conflict(new { message = "Ya existe un coordinador o docente con ese email." }),
            _ => NoContent()
        };
    }

    [Authorize(Policy = PermissionNames.InstructorsManage)]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _instructorsService.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = "Docente no encontrado." });

        return NoContent();
    }

}
