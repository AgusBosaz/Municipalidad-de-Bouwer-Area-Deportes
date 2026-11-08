using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;
using System.Security.Claims;
using Muni_Bouwer.Business.Services;

namespace Muni_Bouwer.Api.Controllers
{
    [Route("api/students/{studentId}/medical-record")]
    [ApiController]
    public class MedicalRecordsController : ControllerBase
    {
        private const long MaxPdfBytes = 10 * 1024 * 1024;
        private readonly MedicalRecordService _medicalRecordService;
        private readonly StudentService _studentService;

        public MedicalRecordsController(
            MedicalRecordService medicalRecordService,
            StudentService studentService)
        {
            _medicalRecordService = medicalRecordService;
            _studentService = studentService;
        }

        [Authorize(Policy = PermissionNames.MedicalRecordsRead)]
        [HttpGet]
        public async Task<ActionResult<MedicalRecordResponseDto>> Get(int studentId)
        {
            Response.Headers.CacheControl = "private, no-store";
            if (!User.IsInRole(RoleNames.Coordinator))
            {
                if (!User.IsInRole(RoleNames.Instructor) ||
                    !int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int instructorId))
                {
                    return Forbid();
                }

                var student = await _studentService.GetByIdAsync(studentId, instructorId);

                if (student is null)
                {
                    return NotFound();
                }
            }
            var record = await _medicalRecordService.GetByStudentIdAsync(studentId);
            if (record == null)
            {
                return NotFound(new { message = "El alumno no posee ficha médica registrada." });
            }
            return Ok(record);
        }

        [Authorize(Policy = PermissionNames.MedicalRecordsManage)]
        [HttpPut("pdf")]
        [RequestSizeLimit(MaxPdfBytes + 65536)]
        public async Task<IActionResult> UploadPdf(int studentId, IFormFile file)
        {
            if (!User.IsInRole(RoleNames.Coordinator)) return Forbid();
            if (await _studentService.GetByIdAsync(studentId) is null) return NotFound();
            if (file is null || file.Length < 5 || file.Length > MaxPdfBytes ||
                !string.Equals(Path.GetExtension(file.FileName), ".pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Seleccioná un PDF de hasta 10 MB." });

            await using var stream = new MemoryStream();
            await file.CopyToAsync(stream);
            var bytes = stream.ToArray();
            if (bytes.Length < 5 || bytes[0] != 0x25 || bytes[1] != 0x50 ||
                bytes[2] != 0x44 || bytes[3] != 0x46 || bytes[4] != 0x2d)
                return BadRequest(new { message = "El archivo no tiene un formato PDF válido." });

            await _medicalRecordService.SavePdfAsync(studentId, bytes);
            return NoContent();
        }

        [Authorize(Policy = PermissionNames.MedicalRecordsRead)]
        [HttpGet("pdf")]
        public async Task<IActionResult> GetPdf(int studentId)
        {
            int? instructorId = null;
            if (!User.IsInRole(RoleNames.Coordinator))
            {
                if (!User.IsInRole(RoleNames.Instructor) ||
                    !int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int id))
                    return Forbid();
                instructorId = id;
            }
            if (await _studentService.GetByIdAsync(studentId, instructorId) is null) return NotFound();
            var content = await _medicalRecordService.GetPdfAsync(studentId);
            if (content is null) return NotFound();

            Response.Headers.CacheControl = "private, no-store";
            Response.Headers.XContentTypeOptions = "nosniff";
            return File(content, "application/pdf");
        }

        [Authorize(Policy = PermissionNames.MedicalRecordsManage)]
        [HttpPut]
        public async Task<IActionResult> Upsert(
            int studentId,
            [FromBody] UpsertMedicalRecordDto dto)
        {
            if (!User.IsInRole(RoleNames.Coordinator)) return Forbid();
            if (await _studentService.GetByIdAsync(studentId) is null) return NotFound();
            Response.Headers.CacheControl = "private, no-store";
            var updated = await _medicalRecordService.SaveOrUpdateAsync(studentId, dto);
            return Ok(new { message = "Ficha médica guardada con éxito.", data = updated });
        }
    }
}
