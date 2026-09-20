using Microsoft.AspNetCore.Mvc;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlumnoController : ControllerBase
{
    private readonly ILogger<AlumnoController> _logger;

    public AlumnoController(ILogger<AlumnoController> logger)
    {
        _logger = logger;
    }

}
