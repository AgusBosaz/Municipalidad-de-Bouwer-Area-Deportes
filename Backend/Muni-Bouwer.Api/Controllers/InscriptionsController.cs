using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business;

namespace Muni_Bouwer.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InscriptionsController : ControllerBase
    {
        private readonly EnrollmentService _enrollmentService;

        public InscriptionsController(EnrollmentService enrollmentService)
        {
            _enrollmentService = enrollmentService;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterStudentDto dto)
        {
            try
            {
                var result = await _enrollmentService.RegisterStudentAsync(dto.StudentId, dto.ActivityId);
                return Ok(new { message = "Alumno inscripto con éxito.", data = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _enrollmentService.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var enrollment = await _enrollmentService.GetByIdAsync(id);
            if (enrollment == null)
            {
                return NotFound(new { message = "Inscripción no encontrada." });
            }
            return Ok(enrollment);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _enrollmentService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Inscripción no encontrada para eliminar." });
            }
            return Ok(new { message = "Inscripción eliminada con éxito." });
        }
    }

    public class RegisterStudentDto
    {
        public int StudentId { get; set; }
        public int ActivityId { get; set; }
    }

}