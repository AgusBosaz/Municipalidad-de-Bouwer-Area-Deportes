using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Muni_Bouwer.Business;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;

namespace Muni_Bouwer.Api.Controllers
{
    [Route("api/students/{studentId}/documents")]
    [ApiController]
    [Authorize(Policy = PermissionNames.DocumentsManage)]
    public class StudentDocumentsController : ControllerBase
    {
        private readonly DocumentService _documentService;

        public StudentDocumentsController(DocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DocumentResponseDto>>> GetByStudent(
            int studentId)
        {
            var documents = await _documentService.GetByStudentIdAsync(studentId);
            return Ok(documents);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            int studentId,
            [FromBody] CreateDocumentDto request)
        {
            var created = await _documentService.AddDocumentAsync(studentId, request);
            return Ok(new { message = "Documentación registrada con éxito.", data = created });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int studentId, int id)
        {
            var deleted = await _documentService.DeactivateAsync(studentId, id);
            if (!deleted)
            {
                return NotFound(new { message = "Documento no encontrado." });
            }
            return Ok(new { message = "Documento eliminado con éxito." });
        }
    }
}
