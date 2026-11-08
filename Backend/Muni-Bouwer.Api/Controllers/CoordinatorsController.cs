using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = RoleNames.Coordinator, Policy = PermissionNames.UsersManage)]
public class CoordinatorsController(CoordinatorService coordinatorService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CoordinatorListDto>>> GetActive() =>
        Ok(await coordinatorService.GetActiveAsync());

    [HttpPost]
    public async Task<ActionResult<CreateCoordinatorResponseDto>> Create(CreateCoordinatorDto dto)
    {
        var result = await coordinatorService.CreateAsync(dto);
        if (result is null)
            return Conflict(new { message = "Ya existe un usuario con ese DNI o un coordinador o docente con ese email." });

        Response.Headers.CacheControl = "no-store";
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
