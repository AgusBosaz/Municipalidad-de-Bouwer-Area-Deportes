namespace Muni_Bouwer.Api.Controllers;

using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.DTOs;

[ApiController]
[Route("api/[controller]")]
public class ActivityController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivityController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var activities = await _activityService.GetAllAsync();
        return Ok(activities);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var activity = await _activityService.GetByIdAsync(id);
        if (activity == null) return NotFound(new { message = $"No se encontró la actividad con ID {id}." });

        return Ok(activity);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateActivityDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var createdActivity = await _activityService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = createdActivity.Id }, createdActivity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateActivityDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var updated = await _activityService.UpdateAsync(id, dto);
        if (!updated) return NotFound(new { message = $"No se encontró la actividad con ID {id} para actualizar." });

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _activityService.DeleteAsync(id);
        if (!deleted) return NotFound(new { message = $"No se encontró la actividad con ID {id} para eliminar." });

        return NoContent();
    }
}