using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Api.Controllers
{
    [Route("api/students/{studentId}/documents")]
    [ApiController]
    public class StudentDocumentsController : ControllerBase
    {
        private readonly DocumentService _documentService;

        public StudentDocumentsController(DocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByStudent(int studentId)
        {
            var documents = await _documentService.GetByStudentIdAsync(studentId);
            return Ok(documents);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int studentId, [FromBody] Documentation document)
        {
            document.StudentId = studentId;
            var created = await _documentService.AddDocumentAsync(document);
            return Ok(new { message = "Documentación registrada con éxito.", data = created });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _documentService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound(new { message = "Documento no encontrado." });
            }
            return Ok(new { message = "Documento eliminado con éxito." });
        }
    }
}