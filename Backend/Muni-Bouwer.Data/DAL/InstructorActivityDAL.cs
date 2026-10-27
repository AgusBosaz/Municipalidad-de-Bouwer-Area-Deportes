using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public interface IInstructorActivityDAL
{
    Task<Instructor?> GetActiveInstructorAsync(int instructorId);
    Task<Activity?> GetActivityAsync(int activityId);
    Task<bool> ExistsAsync(int instructorId, int activityId);
    Task<List<InstructorActivity>> GetAllAsync(int? instructorId);
    Task<InstructorActivity> AddAsync(InstructorActivity assignment);
    Task<bool> DeleteAsync(int id);
}

public class InstructorActivityDAL : IInstructorActivityDAL
{
    private readonly BouwerDbContext _context;

    public InstructorActivityDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<Instructor?> GetActiveInstructorAsync(int instructorId)
    {
        return await _context.Set<Instructor>()
            .FirstOrDefaultAsync(i => i.Id == instructorId && i.IsActive);
    }

    public async Task<Activity?> GetActivityAsync(int activityId)
    {
        return await _context.Set<Activity>()
            .FirstOrDefaultAsync(a => a.Id == activityId && a.IsActive);
    }

    public async Task<bool> ExistsAsync(int instructorId, int activityId)
    {
        return await _context.Set<InstructorActivity>()
            .AnyAsync(ia => ia.InstructorId == instructorId &&
                ia.ActivityId == activityId && ia.IsActive);
    }

    public async Task<List<InstructorActivity>> GetAllAsync(int? instructorId)
    {
        IQueryable<InstructorActivity> query = _context.Set<InstructorActivity>()
            .Where(ia => ia.IsActive)
            .Include(ia => ia.Instructor)
            .Include(ia => ia.Activity);

        if (instructorId.HasValue)
            query = query.Where(ia => ia.InstructorId == instructorId.Value);

        return await query.ToListAsync();
    }

    public async Task<InstructorActivity> AddAsync(InstructorActivity assignment)
    {
        _context.Set<InstructorActivity>().Add(assignment);
        await _context.SaveChangesAsync();
        return assignment;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _context.Set<InstructorActivity>()
            .FirstOrDefaultAsync(ia => ia.Id == id && ia.IsActive);
        if (existing is null)
            return false;

        existing.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
