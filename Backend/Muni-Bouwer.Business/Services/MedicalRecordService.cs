using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business
{
    public class MedicalRecordService
    {
        private readonly BouwerDbContext _context;

        public MedicalRecordService(BouwerDbContext context)
        {
            _context = context;
        }

        public async Task<MedicalRecord?> GetByStudentIdAsync(int studentId)
        {
            return await _context.MedicalRecords
                .FirstOrDefaultAsync(mr => mr.StudentId == studentId);
        }

        public async Task<MedicalRecord> SaveOrUpdateAsync(int studentId, MedicalRecord dto)
        {
            var existingRecord = await _context.MedicalRecords
                .FirstOrDefaultAsync(mr => mr.StudentId == studentId);

            if (existingRecord == null)
            {
                dto.StudentId = studentId;
                _context.MedicalRecords.Add(dto);
                await _context.SaveChangesAsync();
                return dto;
            }
            else
            {
                _context.Entry(existingRecord).CurrentValues.SetValues(dto);
                existingRecord.StudentId = studentId;
                
                await _context.SaveChangesAsync();
                return existingRecord;
            }
        }
    }
}