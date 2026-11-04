using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.DTOs;
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

        public async Task<MedicalRecordResponseDto?> GetByStudentIdAsync(int studentId)
        {
            return await _context.MedicalRecords
                .AsNoTracking()
                .Where(record => record.StudentId == studentId)
                .Select(record => new MedicalRecordResponseDto
                {
                    Id = record.Id,
                    StudentId = record.StudentId,
                    Diseases = record.Diseases,
                    Cus = record.Cus,
                    Observations = record.Observations
                })
                .FirstOrDefaultAsync();
        }

        public async Task<MedicalRecordResponseDto> SaveOrUpdateAsync(
            int studentId,
            UpsertMedicalRecordDto dto)
        {
            var existingRecord = await _context.MedicalRecords
                .FirstOrDefaultAsync(mr => mr.StudentId == studentId);

            if (existingRecord == null)
            {
                existingRecord = new MedicalRecord
                {
                    StudentId = studentId
                };

                _context.MedicalRecords.Add(existingRecord);
            }

            existingRecord.Diseases = dto.Diseases;
            existingRecord.Cus = dto.Cus;
            existingRecord.Observations = dto.Observations;

            await _context.SaveChangesAsync();

            return new MedicalRecordResponseDto
            {
                Id = existingRecord.Id,
                StudentId = existingRecord.StudentId,
                Diseases = existingRecord.Diseases,
                Cus = existingRecord.Cus,
                Observations = existingRecord.Observations
            };
        }
    }
}
