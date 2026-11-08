using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public interface IAssignmentService
{
    Task<List<AssignmentResponseDto>> GetAllAsync(int? instructorId);
    Task<(string? Error, AssignmentResponseDto? Result, string? ConflictName)> AssignAsync(AssignInstructorDto dto);
    Task<bool> UnassignAsync(int id);
}

public class AssignmentService : IAssignmentService
{
    private readonly IInstructorActivityDAL _dal;

    public AssignmentService(IInstructorActivityDAL dal)
    {
        _dal = dal;
    }

    public async Task<List<AssignmentResponseDto>> GetAllAsync(int? instructorId)
    {
        var assignments = await _dal.GetAllAsync(instructorId);
        return assignments.Select(ToDto).ToList();
    }

    // Error: "instructor_notfound", "activity_notfound", "duplicate" o null (ok).
    public async Task<(string? Error, AssignmentResponseDto? Result, string? ConflictName)> AssignAsync(AssignInstructorDto dto)
    {
        var (error, assignment, conflictName) = await _dal.AssignCheckedAsync(dto.InstructorId, dto.ActivityId);
        return (error, assignment is null ? null : ToDto(assignment), conflictName);
    }

    public async Task<bool> UnassignAsync(int id)
    {
        return await _dal.DeleteAsync(id);
    }

    private static AssignmentResponseDto ToDto(InstructorActivity ia) => new()
    {
        Id = ia.Id,
        InstructorId = ia.InstructorId,
        InstructorName = $"{ia.Instructor.FirstName} {ia.Instructor.LastName}",
        ActivityId = ia.ActivityId,
        ActivityName = ia.Activity.Name,
        StartTime = ia.Activity.StartTime,
        EndTime = ia.Activity.EndTime,
        Days = ia.Activity.Days
    };
}
