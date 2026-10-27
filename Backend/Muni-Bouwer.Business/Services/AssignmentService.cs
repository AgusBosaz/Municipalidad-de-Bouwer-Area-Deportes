using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public interface IAssignmentService
{
    Task<List<AssignmentResponseDto>> GetAllAsync(int? instructorId);
    Task<(string? Error, AssignmentResponseDto? Result)> AssignAsync(AssignInstructorDto dto);
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
    public async Task<(string? Error, AssignmentResponseDto? Result)> AssignAsync(AssignInstructorDto dto)
    {
        var instructor = await _dal.GetActiveInstructorAsync(dto.InstructorId);
        if (instructor is null)
            return ("instructor_notfound", null);

        var activity = await _dal.GetActivityAsync(dto.ActivityId);
        if (activity is null)
            return ("activity_notfound", null);

        if (await _dal.ExistsAsync(dto.InstructorId, dto.ActivityId))
            return ("duplicate", null);

        // Alerta conservadora: Activity no tiene día, así que se comparan solo los horarios.
        var current = await _dal.GetAllAsync(dto.InstructorId);
        var warnings = current
            .Where(ia => ia.Activity.StartTime < activity.EndTime
                      && activity.StartTime < ia.Activity.EndTime)
            .Select(ia => $"Posible superposición con \"{ia.Activity.Name}\" " +
                          $"({ia.Activity.StartTime:HH:mm}-{ia.Activity.EndTime:HH:mm}). " +
                          "No se considera el día de la semana.")
            .ToList();

        var created = await _dal.AddAsync(new InstructorActivity
        {
            InstructorId = dto.InstructorId,
            ActivityId = dto.ActivityId
        });

        created.Instructor = instructor;
        created.Activity = activity;

        var result = ToDto(created);
        result.Warnings = warnings;
        return (null, result);
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
        EndTime = ia.Activity.EndTime
    };
}
