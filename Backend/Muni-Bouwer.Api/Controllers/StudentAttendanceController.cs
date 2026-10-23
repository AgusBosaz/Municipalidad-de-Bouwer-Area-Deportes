using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
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

    [HttpGet]
    public async Task<ActionResult<List<StudentAttendanceResponseDto>>> GetAll()
    {
        var attendances = await _service.GetAllAsync();
        return Ok(attendances);
    }

    [HttpPost]
    public async Task<ActionResult<StudentAttendanceResponseDto>> Create([FromBody] StudentAttendanceCreateDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}