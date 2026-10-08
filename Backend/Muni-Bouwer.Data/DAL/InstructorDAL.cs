using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Data.Context;

namespace Muni_Bouwer.Data.DAL;

public class InstructorDAL
{
    private readonly BouwerDbContext _context;

    public InstructorDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByDniAsync(string dni, int? excludeId = null)
    {
        return await _context.Set<User>()
            .AnyAsync(u => u.Dni == dni && u.Id != excludeId);
    }

    public async Task<List<Instructor>> GetAllAsync()
    {
        return await _context.Set<Instructor>()
            .Where(i => i.IsActive)
            .ToListAsync();
    }

    public async Task<Instructor?> GetByIdAsync(int id)
    {
        return await _context.Set<Instructor>()
            .FirstOrDefaultAsync(i => i.Id == id && i.IsActive);
    }

    public async Task<Instructor> AddAsync(Instructor instructor)
    {
        _context.Set<Instructor>().Add(instructor);
        await _context.SaveChangesAsync();
        return instructor;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}