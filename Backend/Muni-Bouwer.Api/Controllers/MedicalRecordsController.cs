using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Api.Controllers
{
    [Route("api/students/{studentId}/medical-record")]
    [ApiController]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly MedicalRecordService _medicalRecordService;

        public MedicalRecordsController(MedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        [HttpGet]
        public async Task<IActionResult> Get(int studentId)
        {
            var record = await _medicalRecordService.GetByStudentIdAsync(studentId);
            if (record == null)
            {
                return NotFound(new { message = "El alumno no posee ficha médica registrada." });
            }
            return Ok(record);
        }

        [HttpPut]
        public async Task<IActionResult> Upsert(int studentId, [FromBody] MedicalRecord dto)
        {
            var updated = await _medicalRecordService.SaveOrUpdateAsync(studentId, dto);
            return Ok(new { message = "Ficha médica guardada con éxito.", data = updated });
        }
    }
}   