using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business
{
    public class DocumentService
    {
        private readonly BouwerDbContext _context;

        public DocumentService(BouwerDbContext context)
        {
            _context = context;
        }

        public async Task<List<DocumentResponseDto>> GetByStudentIdAsync(int studentId)
        {
            return await _context.Documents
                .AsNoTracking()
                .Where(document =>
                    document.StudentId == studentId &&
                    document.IsActive)
                .Select(document => new DocumentResponseDto
                {
                    Id = document.Id,
                    StudentId = document.StudentId,
                    Type = document.Type,
                    FileUrl = document.FileUrl,
                    UploadedAt = document.UploadedAt
                })
                .ToListAsync();
        }

        public async Task<DocumentResponseDto> AddDocumentAsync(
            int studentId,
            CreateDocumentDto request)
        {
            Documentation document = new()
            {
                StudentId = studentId,
                Type = request.Type,
                FileUrl = request.FileUrl,
                UploadedAt = DateOnly.FromDateTime(DateTime.Now),
                IsActive = true
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return new DocumentResponseDto
            {
                Id = document.Id,
                StudentId = document.StudentId,
                Type = document.Type,
                FileUrl = document.FileUrl,
                UploadedAt = document.UploadedAt
            };
        }

        public async Task<bool> DeactivateAsync(int studentId, int id)
        {
            Documentation? document = await _context.Documents
                .FirstOrDefaultAsync(item =>
                    item.Id == id &&
                    item.StudentId == studentId &&
                    item.IsActive);

            if (document is null)
            {
                return false;
            }

            document.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
