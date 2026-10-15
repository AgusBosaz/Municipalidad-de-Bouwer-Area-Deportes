using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business
{
    public class EnrollmentService
    {
        private readonly BouwerDbContext _context;

        public EnrollmentService(BouwerDbContext context)
        {
            _context = context;
        }

        public async Task<Enrollment> RegisterStudentAsync(int studentId, int activityId)
        {

            var studentActivity = await _context.StudentActivities
                .FirstOrDefaultAsync(sa => sa.StudentId == studentId && sa.ActivityId == activityId);

            if (studentActivity == null)
            {
                studentActivity = new StudentActivity
                {
                    StudentId = studentId,
                    ActivityId = activityId
                };
                _context.StudentActivities.Add(studentActivity);
                await _context.SaveChangesAsync();
            }

            // 2. Verificar si ya cuenta con una inscripción para esa asignación
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentActivityId == studentActivity.Id);

            if (existingEnrollment != null)
            {
                throw new InvalidOperationException("El alumno ya se encuentra inscripto en esta actividad.");
            }

            // 3. Crear la inscripción
            var enrollment = new Enrollment
            {
                StudentActivityId = studentActivity.Id,
                EnrollmentDate = DateOnly.FromDateTime(DateTime.Now)
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return enrollment;
        }

        public async Task<IEnumerable<Enrollment>> GetAllAsync()
        {
            return await _context.Enrollments
                .Include(e => e.StudentActivity)
                    .ThenInclude(sa => sa.Student)
                .Include(e => e.StudentActivity)
                    .ThenInclude(sa => sa.Activity)
                .ToListAsync();
        }

        public async Task<Enrollment?> GetByIdAsync(int id)
        {
            return await _context.Enrollments
                .Include(e => e.StudentActivity)
                    .ThenInclude(sa => sa.Student)
                .Include(e => e.StudentActivity)
                    .ThenInclude(sa => sa.Activity)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null) return false;

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}