using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class StudentAttendanceService
{
    private readonly StudentAttendanceDal _dal;

    public StudentAttendanceService(StudentAttendanceDal dal)
    {
        _dal = dal;
    }

    public async Task<List<StudentAttendanceResponseDto>> GetAllAsync(int? instructorId = null)
    {
        var list = await _dal.GetAllAsync(instructorId);
        return list.Select(ToResponseDto).ToList();
    }

    public async Task<List<AttendanceHistoryDto>> GetHistoryAsync(
        int? instructorId = null)
    {
        return await _dal.GetHistoryAsync(instructorId);
    }

    public async Task<StudentAttendanceResponseDto?> GetByIdAsync(int id)
    {
        var attendance = await _dal.GetByIdAsync(id);
        return attendance is null ? null : ToResponseDto(attendance);
    }

    public async Task<List<StudentAttendanceResponseDto>> GetByActivityAndDateAsync(
        int activityId, DateOnly date, int? instructorId)
    {
        var list = await _dal.GetByActivityAndDateAsync(activityId, date, instructorId);
        return list.Select(ToResponseDto).ToList();
    }

    public Task<bool> CanAccessActivityAsync(int activityId, int? instructorId) =>
        _dal.CanAccessActivityAsync(activityId, instructorId);

    public Task<bool> HasActiveEnrollmentAsync(int studentActivityId) =>
        _dal.HasActiveEnrollmentAsync(studentActivityId);

    public Task<bool> ExistsForDateAsync(
        int studentActivityId, DateOnly date, int? excludeId = null) =>
        _dal.ExistsForDateAsync(studentActivityId, date, excludeId);

    public Task<bool> IsAssignedToStudentActivityAsync(
        int studentActivityId, int instructorId) =>
        _dal.IsAssignedToStudentActivityAsync(studentActivityId, instructorId);

    public Task<List<AttendanceStudentDto>> GetStudentsByActivityAsync(int activityId) =>
        _dal.GetStudentsByActivityAsync(activityId);

    public Task SaveActivityAttendanceAsync(
        DateOnly date, IReadOnlyList<AttendanceEntryDto> entries) =>
        _dal.SaveActivityAttendanceAsync(date, entries);

    public async Task<StudentAttendanceResponseDto> CreateAsync(StudentAttendanceCreateDto dto)
    {
        var attendance = new StudentAttendance
        {
            StudentActivityId = dto.StudentActivityId,
            Date = dto.Date,
            IsPresent = dto.IsPresent
        };

        var result = await _dal.CreateAsync(attendance);

        return ToResponseDto(result);
    }

    public async Task<StudentAttendanceResponseDto?> UpdateAsync(int id, StudentAttendanceUpdateDto dto)
    {
        var attendance = new StudentAttendance
        {
            Id = id,
            StudentActivityId = dto.StudentActivityId,
            Date = dto.Date,
            IsPresent = dto.IsPresent
        };

        var result = await _dal.UpdateAsync(attendance);
        if (result == null) return null;

        return ToResponseDto(result);
    }

    public async Task<List<StudentAttendanceResponseDto>> GetByInstructorIdAsync(int instructorId)
    {
        var list = await _dal.GetByInstructorIdAsync(instructorId);
        return list.Select(ToResponseDto).ToList();
    }

    private static StudentAttendanceResponseDto ToResponseDto(StudentAttendance attendance) =>
        new()
        {
            Id = attendance.Id,
            StudentActivityId = attendance.StudentActivityId,
            Date = attendance.Date,
            IsPresent = attendance.IsPresent
        };
}
