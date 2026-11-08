namespace Muni_Bouwer.Data.DAL;

using Microsoft.EntityFrameworkCore;
using System.Data;
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

    public async Task<(bool Updated, string? Conflict)> UpdateAsync(Activity activity)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var existing = await _context.Activities.FindAsync(activity.Id);
        if (existing is null || !existing.IsActive) return (false, null);

        if (existing.Days != activity.Days || existing.StartTime != activity.StartTime || existing.EndTime != activity.EndTime)
        {
            var assignedInstructorIds = _context.InstructorActivities
                .Where(item => item.ActivityId == activity.Id && item.IsActive && item.Instructor.IsActive)
                .Select(item => item.InstructorId);
            var conflict = await _context.InstructorActivities
                .Where(item => item.ActivityId != activity.Id && item.IsActive &&
                    item.Activity.IsActive && item.Instructor.IsActive &&
                    assignedInstructorIds.Contains(item.InstructorId) &&
                    (item.Activity.Days & activity.Days) != ActivityDays.None &&
                    item.Activity.StartTime < activity.EndTime &&
                    activity.StartTime < item.Activity.EndTime)
                .Select(item => new { item.Instructor.FirstName, item.Instructor.LastName, ActivityName = item.Activity.Name })
                .FirstOrDefaultAsync();
            if (conflict is not null)
                return (false, $"El horario se superpone con \"{conflict.ActivityName}\", asignada a {conflict.FirstName} {conflict.LastName}.");
        }

        existing.Name = activity.Name;
        existing.Category = activity.Category;
        existing.StartTime = activity.StartTime;
        existing.EndTime = activity.EndTime;
        existing.Days = activity.Days;
        existing.Location = activity.Location;
        existing.MaximumCapacity = activity.MaximumCapacity;
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var activity = await _context.Activities.FindAsync(id);
        if (activity is null || !activity.IsActive) return false;

        activity.IsActive = false;
        return await _context.SaveChangesAsync() > 0;
    }
}
