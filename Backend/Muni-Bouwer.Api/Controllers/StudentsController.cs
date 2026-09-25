using Microsoft.AspNetCore.Mvc;

namespace Muni_Bouwer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(ILogger<StudentsController> logger)
    {
        _logger = logger;
    }
}
