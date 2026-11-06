using Microsoft.EntityFrameworkCore;
using System.Data;
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
    Task<(string? Error, InstructorActivity? Assignment, string? ConflictName)> AssignCheckedAsync(int instructorId, int activityId);
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
            .Where(ia => ia.IsActive && ia.Activity.IsActive && ia.Instructor.IsActive)
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

    public async Task<(string? Error, InstructorActivity? Assignment, string? ConflictName)> AssignCheckedAsync(int instructorId, int activityId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
        var instructor = await GetActiveInstructorAsync(instructorId);
        if (instructor is null) return ("instructor_notfound", null, null);
        var activity = await GetActivityAsync(activityId);
        if (activity is null) return ("activity_notfound", null, null);
        if (await ExistsAsync(instructorId, activityId)) return ("duplicate", null, null);

        var conflict = await _context.InstructorActivities
            .Where(item => item.InstructorId == instructorId && item.IsActive &&
                item.Activity.IsActive &&
                (item.Activity.Days & activity.Days) != ActivityDays.None &&
                item.Activity.StartTime < activity.EndTime &&
                activity.StartTime < item.Activity.EndTime)
            .Select(item => item.Activity.Name)
            .FirstOrDefaultAsync();
        if (conflict is not null) return ("schedule_conflict", null, conflict);

        var assignment = new InstructorActivity { InstructorId = instructorId, ActivityId = activityId };
        _context.InstructorActivities.Add(assignment);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        assignment.Instructor = instructor;
        assignment.Activity = activity;
        return (null, assignment, null);
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
