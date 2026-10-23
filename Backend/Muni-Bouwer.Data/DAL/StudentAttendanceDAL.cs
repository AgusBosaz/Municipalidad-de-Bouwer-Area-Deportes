using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class StudentAttendanceDal
{
    private readonly BouwerDbContext _context;

    public StudentAttendanceDal(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<List<StudentAttendance>> GetAllAsync()
    {
        return await _context.StudentAttendances
            .Include(a => a.StudentActivity)
            .ToListAsync();
    }

    public async Task<StudentAttendance?> GetByIdAsync(int id)
    {
        return await _context.StudentAttendances
            .Include(a => a.StudentActivity)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<StudentAttendance> CreateAsync(StudentAttendance attendance)
    {
        _context.StudentAttendances.Add(attendance);
        await _context.SaveChangesAsync();
        return attendance;
    }
}