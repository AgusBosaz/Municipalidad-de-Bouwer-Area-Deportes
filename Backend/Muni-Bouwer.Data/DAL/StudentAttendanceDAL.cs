using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class StudentAttendanceDal
{
    private readonly BouwerDbContext _context;

    public StudentAttendanceDal(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentAttendance>> GetAllAsync(int? instructorId = null)
    {
        IQueryable<StudentAttendance> query = _context.StudentAttendances;

        if (instructorId is int id)
        {
            query = query.Where(attendance =>
                attendance.StudentActivity.Student.IsActive &&
                attendance.StudentActivity.Activity.IsActive &&
                attendance.StudentActivity.Enrollments.Any(enrollment =>
                    enrollment.Status == EnrollmentStatuses.Active) &&
                attendance.StudentActivity.Activity.InstructorActivities.Any(
                    assignment => assignment.InstructorId == id &&
                                  assignment.IsActive));
        }

        return await query.ToListAsync();
    }

    public async Task<List<AttendanceHistoryDto>> GetHistoryAsync(
        int? instructorId = null)
    {
        IQueryable<StudentAttendance> query = _context.StudentAttendances;

        if (instructorId is int id)
        {
            query = query.Where(attendance =>
                attendance.StudentActivity.Student.IsActive &&
                attendance.StudentActivity.Activity.IsActive &&
                attendance.StudentActivity.Enrollments.Any(enrollment =>
                    enrollment.Status == EnrollmentStatuses.Active) &&
                attendance.StudentActivity.Activity.InstructorActivities.Any(
                    assignment => assignment.InstructorId == id &&
                                  assignment.IsActive));
        }

        return await query
            .Select(attendance => new AttendanceHistoryDto
            {
                AttendanceId = attendance.Id,
                ActivityId = attendance.StudentActivity.ActivityId,
                ActivityName = attendance.StudentActivity.Activity.Name,
                StudentId = attendance.StudentActivity.StudentId,
                StudentName = attendance.StudentActivity.Student.FirstName + " " +
                              attendance.StudentActivity.Student.LastName,
                StudentDni = attendance.StudentActivity.Student.Dni,
                Date = attendance.Date,
                IsPresent = attendance.IsPresent
            })
            .ToListAsync();
    }

    public async Task<StudentAttendance?> GetByIdAsync(int id)
    {
        return await _context.StudentAttendances
            .Include(a => a.StudentActivity)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public Task<bool> ExistsForDateAsync(
        int studentActivityId, DateOnly date, int? excludeId = null) =>
        _context.StudentAttendances.AnyAsync(attendance =>
            attendance.StudentActivityId == studentActivityId &&
            attendance.Date == date &&
            (!excludeId.HasValue || attendance.Id != excludeId.Value));

    public async Task<List<StudentAttendance>> GetByActivityAndDateAsync(
        int activityId, DateOnly date, int? instructorId)
    {
        IQueryable<StudentAttendance> query = _context.StudentAttendances
            .AsNoTracking()
            .Where(attendance =>
                attendance.StudentActivity.ActivityId == activityId &&
                attendance.Date == date);

        if (instructorId.HasValue)
        {
            query = query.Where(attendance =>
                attendance.StudentActivity.Student.IsActive &&
                attendance.StudentActivity.Enrollments.Any(enrollment =>
                    enrollment.Status == EnrollmentStatuses.Active));
        }

        return await query.ToListAsync();
    }

    public async Task<StudentAttendance> CreateAsync(StudentAttendance attendance)
    {
        _context.StudentAttendances.Add(attendance);
        await _context.SaveChangesAsync();
        return attendance;
    }

    public async Task<StudentAttendance?> UpdateAsync(StudentAttendance attendance)
    {
        var existingAttendance = await _context.StudentAttendances.FindAsync(attendance.Id);
        if (existingAttendance == null) return null;

        existingAttendance.StudentActivityId = attendance.StudentActivityId;
        existingAttendance.Date = attendance.Date;
        existingAttendance.IsPresent = attendance.IsPresent;

        await _context.SaveChangesAsync();
        return existingAttendance;
    }

    public async Task<List<StudentAttendance>> GetByInstructorIdAsync(int instructorId)
    {
        return await GetAllAsync(instructorId);
    }

    public async Task<bool> CanAccessActivityAsync(int activityId, int? instructorId)
    {
        IQueryable<Activity> activities = _context.Activities
            .Where(activity => activity.Id == activityId && activity.IsActive);

        if (instructorId is int id)
        {
            activities = activities.Where(activity =>
                activity.InstructorActivities.Any(assignment =>
                    assignment.InstructorId == id && assignment.IsActive));
        }

        return await activities.AnyAsync();
    }

    public async Task<bool> HasActiveEnrollmentAsync(int studentActivityId)
    {
        return await _context.StudentActivities.AnyAsync(studentActivity =>
            studentActivity.Id == studentActivityId &&
            studentActivity.Student.IsActive &&
            studentActivity.Activity.IsActive &&
            studentActivity.Enrollments.Any(enrollment =>
                enrollment.Status == EnrollmentStatuses.Active));
    }

    public async Task<bool> IsAssignedToStudentActivityAsync(
        int studentActivityId, int instructorId)
    {
        return await _context.StudentActivities.AnyAsync(studentActivity =>
            studentActivity.Id == studentActivityId &&
            studentActivity.Activity.InstructorActivities.Any(assignment =>
                assignment.InstructorId == instructorId && assignment.IsActive));
    }

    public async Task<List<AttendanceStudentDto>> GetStudentsByActivityAsync(int activityId)
    {
        return await _context.StudentActivities
            .AsNoTracking()
            .Where(studentActivity =>
                studentActivity.ActivityId == activityId &&
                studentActivity.Student.IsActive &&
                studentActivity.Enrollments.Any(enrollment =>
                    enrollment.Status == EnrollmentStatuses.Active))
            .Select(studentActivity => new AttendanceStudentDto
            {
                StudentActivityId = studentActivity.Id,
                StudentId = studentActivity.StudentId,
                FirstName = studentActivity.Student.FirstName,
                LastName = studentActivity.Student.LastName,
                Dni = studentActivity.Student.Dni
            })
            .ToListAsync();
    }

    public async Task SaveActivityAttendanceAsync(
        DateOnly date, IReadOnlyList<AttendanceEntryDto> entries)
    {
        if (entries.Count == 0)
            return;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        int[] studentActivityIds = entries
            .Select(entry => entry.StudentActivityId)
            .ToArray();
        List<StudentAttendance> existing = await _context.StudentAttendances
            .Where(attendance =>
                studentActivityIds.Contains(attendance.StudentActivityId) &&
                attendance.Date == date)
            .ToListAsync();

        foreach (AttendanceEntryDto entry in entries)
        {
            List<StudentAttendance> previous = existing
                .Where(attendance =>
                    attendance.StudentActivityId == entry.StudentActivityId)
                .ToList();

            if (previous.Count == 0)
            {
                _context.StudentAttendances.Add(new StudentAttendance
                {
                    StudentActivityId = entry.StudentActivityId,
                    Date = date,
                    IsPresent = entry.IsPresent
                });
            }
            else
            {
                foreach (StudentAttendance attendance in previous)
                    attendance.IsPresent = entry.IsPresent;
            }
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
    }
}
