using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class StudentDAL
{
    private readonly BouwerDbContext _context;

    public StudentDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByDniAsync(string dni, int? excludeId = null)
    {
        return await _context.Users
            .AnyAsync(user => user.Dni == dni && user.Id != excludeId);
    }

    public async Task<List<Student>> GetAllAsync(int? instructorId = null)
    {
        return await ReadableStudents(instructorId).ToListAsync();
    }

    public async Task<Student?> GetByIdAsync(int id, int? instructorId = null)
    {
        return await ReadableStudents(instructorId)
            .FirstOrDefaultAsync(student => student.Id == id);
    }

    private IQueryable<Student> ReadableStudents(int? instructorId)
    {
        IQueryable<Student> students = _context.Students;

        if (instructorId is int id)
        {
            students = students.Where(student =>
                student.IsActive &&
                student.StudentActivities.Any(studentActivity =>
                    studentActivity.Activity.IsActive &&
                    studentActivity.Enrollments.Any(enrollment =>
                        enrollment.Status == EnrollmentStatuses.Active) &&
                    studentActivity.Activity.InstructorActivities.Any(assignment =>
                        assignment.InstructorId == id && assignment.IsActive)));
        }

        return students;
    }

    public async Task<Student> CreateAsync(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();

        return student;
    }

    public async Task<bool> UpdateAsync(Student student)
    {
        _context.Students.Update(student);

        return await _context.SaveChangesAsync() > 0;
    }
}
