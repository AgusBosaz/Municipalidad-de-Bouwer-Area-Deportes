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
        [HttpPut]
        public async Task<IActionResult> Upsert(
            int studentId,
            [FromBody] UpsertMedicalRecordDto dto)
        {
            var updated = await _medicalRecordService.SaveOrUpdateAsync(studentId, dto);
            return Ok(new { message = "Ficha médica guardada con éxito.", data = updated });
        }
    }
}
