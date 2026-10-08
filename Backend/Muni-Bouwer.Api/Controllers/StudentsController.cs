using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
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

    [HttpGet]
    public IActionResult GetAll()
    {
        var students = _studentService.GetAll();

        return Ok(students);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var student = _studentService.GetById(id);

        if (student == null)
        {
            return NotFound();
        }

        return Ok(student);
    }

    [HttpPost]
    public IActionResult Create(StudentCreateDTO data)
    {
        var student = _studentService.Create(data);

        return CreatedAtAction(
            nameof(GetById),
            new { id = student.Id },
            student
        );
    }

    [HttpPatch("{id}")]
    public IActionResult Update(int id, StudentUpdateDTO data)
    {
        var updated = _studentService.Update(id, data);

        if (!updated)
        {
            return NotFound();
        }

        return NoContent();
    }
}