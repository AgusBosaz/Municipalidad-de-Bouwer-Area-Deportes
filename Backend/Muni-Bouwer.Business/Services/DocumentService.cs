using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
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

        public async Task<IEnumerable<Documentation>> GetByStudentIdAsync(int studentId)
        {
            return await _context.Documents
                .Where(d => d.StudentId == studentId)
                .ToListAsync();
        }

        public async Task<Documentation> AddDocumentAsync(Documentation document)
        {
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null) return false;

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}