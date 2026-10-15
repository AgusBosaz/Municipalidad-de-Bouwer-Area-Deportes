using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.DTOs;
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

        public async Task<EnrollmentResponseDto> RegisterStudentAsync(int studentId, int activityId)
        {
            var studentExists = await _context.Students
                .AnyAsync(student => student.Id == studentId && student.IsActive);
            if (!studentExists)
            {
                throw new InvalidOperationException("El alumno no existe o está inactivo.");
            }

            var activity = await _context.Activities
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Id == activityId && item.IsActive);
            if (activity is null)
            {
                throw new InvalidOperationException("La actividad no existe.");
            }

            var alreadyEnrolled = await _context.Enrollments
                .AnyAsync(enrollment =>
                    enrollment.StudentActivity.StudentId == studentId &&
                    enrollment.StudentActivity.ActivityId == activityId &&
                    enrollment.Status != EnrollmentStatuses.Cancelled);
            if (alreadyEnrolled)
            {
                throw new InvalidOperationException("El alumno ya se encuentra inscripto en esta actividad.");
            }

            var enrolledCount = await _context.Enrollments
                .CountAsync(enrollment =>
                    enrollment.StudentActivity.ActivityId == activityId &&
                    enrollment.Status != EnrollmentStatuses.Cancelled);
            if (enrolledCount >= activity.MaximumCapacity)
            {
                throw new InvalidOperationException("La actividad no tiene cupos disponibles.");
            }

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

            var enrollment = new Enrollment
            {
                StudentActivityId = studentActivity.Id,
                EnrollmentDate = DateOnly.FromDateTime(DateTime.Now),
                Status = EnrollmentStatuses.Active
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return await ActiveEnrollmentResponses()
                .SingleAsync(item => item.Id == enrollment.Id);
        }

        public async Task<List<EnrollmentResponseDto>> GetAllAsync()
        {
            return await ActiveEnrollmentResponses()
                .ToListAsync();
        }

        public async Task<EnrollmentResponseDto?> GetByIdAsync(int id)
        {
            return await ActiveEnrollmentResponses()
                .FirstOrDefaultAsync(item => item.Id == id);
        }

        public async Task<bool> CancelAsync(int id)
        {
            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment is null ||
                enrollment.Status == EnrollmentStatuses.Cancelled)
            {
                return false;
            }

            enrollment.Status = EnrollmentStatuses.Cancelled;
            await _context.SaveChangesAsync();
            return true;
        }

        private IQueryable<EnrollmentResponseDto> ActiveEnrollmentResponses()
        {
            return _context.Enrollments
                .AsNoTracking()
                .Where(enrollment =>
                    enrollment.Status != EnrollmentStatuses.Cancelled)
                .Select(enrollment => new EnrollmentResponseDto
                {
                    Id = enrollment.Id,
                    StudentActivityId = enrollment.StudentActivityId,
                    StudentId = enrollment.StudentActivity.StudentId,
                    StudentName = enrollment.StudentActivity.Student.FirstName +
                        " " + enrollment.StudentActivity.Student.LastName,
                    ActivityId = enrollment.StudentActivity.ActivityId,
                    ActivityName = enrollment.StudentActivity.Activity.Name,
                    EnrollmentDate = enrollment.EnrollmentDate
                });
        }
    }
}
