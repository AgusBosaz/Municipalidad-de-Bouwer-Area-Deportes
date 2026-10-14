namespace Muni_Bouwer.Data.DAL;

using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

public class ActivityDAL : IActivityDAL
{
    private readonly BouwerDbContext _context;

    public ActivityDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Activity>> GetAllAsync()
    {
        return await _context.Activities
            .Include(a => a.StudentActivities)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Activity?> GetByIdAsync(int id)
    {
        return await _context.Activities
            .Include(a => a.StudentActivities)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<Activity> CreateAsync(Activity activity)
    {
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    public async Task<bool> UpdateAsync(Activity activity)
    {
        _context.Activities.Update(activity);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity == null) return false;

        _context.Activities.Remove(activity);
        return await _context.SaveChangesAsync() > 0;
    }
}