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
            .Where(activity => activity.IsActive)
            .Include(a => a.StudentActivities)
                .ThenInclude(studentActivity => studentActivity.Enrollments)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Activity?> GetByIdAsync(int id)
    {
        return await _context.Activities
            .Include(a => a.StudentActivities)
                .ThenInclude(studentActivity => studentActivity.Enrollments)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id && a.IsActive);
    }

    public async Task<Activity> CreateAsync(Activity activity)
    {
        _context.Activities.Add(activity);
        await _context.SaveChangesAsync();
        return activity;
    }

    public async Task<bool> UpdateAsync(Activity activity)
    {
        var existing = await _context.Activities.FindAsync(activity.Id);
        if (existing is null || !existing.IsActive) return false;

        existing.Name = activity.Name;
        existing.Category = activity.Category;
        existing.StartTime = activity.StartTime;
        existing.EndTime = activity.EndTime;
        existing.Days = activity.Days;
        existing.Location = activity.Location;
        existing.MaximumCapacity = activity.MaximumCapacity;
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity is null || !activity.IsActive) return false;

        activity.IsActive = false;
        return await _context.SaveChangesAsync() > 0;
    }
}
