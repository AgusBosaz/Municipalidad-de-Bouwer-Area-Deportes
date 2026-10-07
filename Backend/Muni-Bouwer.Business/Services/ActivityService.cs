namespace Muni_Bouwer.Business.Services;

using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

public class ActivityService : IActivityService
{
    private readonly IActivityDAL _activityDAL;

    public ActivityService(IActivityDAL activityDAL)
    {
        _activityDAL = activityDAL;
    }

    public async Task<List<ActivityResponseDto>> GetAllAsync()
    {
        var activities = await _activityDAL.GetAllAsync();
        return activities.Select(a => new ActivityResponseDto
        {
            Id = a.Id,
            Name = a.Name,
            Category = a.Category,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            MaximumCapacity = a.MaximumCapacity,
            EnrolledStudentsCount = a.StudentActivities.Count
        }).ToList();
    }

    public async Task<ActivityResponseDto?> GetByIdAsync(int id)
    {
        var a = await _activityDAL.GetByIdAsync(id);
        if (a == null) return null;

        return new ActivityResponseDto
        {
            Id = a.Id,
            Name = a.Name,
            Category = a.Category,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            MaximumCapacity = a.MaximumCapacity,
            EnrolledStudentsCount = a.StudentActivities.Count
        };
    }

    public async Task<ActivityResponseDto> CreateAsync(CreateActivityDto dto)
    {
        var activity = new Activity
        {
            Name = dto.Name,
            Category = dto.Category,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            MaximumCapacity = dto.MaximumCapacity
        };

        var created = await _activityDAL.CreateAsync(activity);

        return new ActivityResponseDto
        {
            Id = created.Id,
            Name = created.Name,
            Category = created.Category,
            StartTime = created.StartTime,
            EndTime = created.EndTime,
            MaximumCapacity = created.MaximumCapacity,
            EnrolledStudentsCount = 0
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateActivityDto dto)
    {
        var existing = await _activityDAL.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Name = dto.Name;
        existing.Category = dto.Category;
        existing.StartTime = dto.StartTime;
        existing.EndTime = dto.EndTime;
        existing.MaximumCapacity = dto.MaximumCapacity;

        return await _activityDAL.UpdateAsync(existing);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        return await _activityDAL.DeleteAsync(id);
    }
}