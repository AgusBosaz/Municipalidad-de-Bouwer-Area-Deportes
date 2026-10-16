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

    public async Task<List<Student>> GetAllAsync()
    {
        return await _context.Students.ToListAsync();
    }

    public async Task<Student?> GetByIdAsync(int id)
    {
        return await _context.Students
            .FirstOrDefaultAsync(student => student.Id == id);
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
