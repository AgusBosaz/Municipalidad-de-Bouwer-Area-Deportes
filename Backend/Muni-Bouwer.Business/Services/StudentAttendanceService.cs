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

    public async Task<List<StudentAttendanceResponseDto>> GetAllAsync()
    {
        var list = await _dal.GetAllAsync();
        return list.Select(a => new StudentAttendanceResponseDto
        {
            Id = a.Id,
            StudentActivityId = a.StudentActivityId,
            Date = a.Date,
            IsPresent = a.IsPresent
        }).ToList();
    }

    public async Task<StudentAttendanceResponseDto> CreateAsync(StudentAttendanceCreateDto dto)
    {
        var attendance = new StudentAttendance
        {
            StudentActivityId = dto.StudentActivityId,
            Date = dto.Date,
            IsPresent = dto.IsPresent
        };

        var result = await _dal.CreateAsync(attendance);

        return new StudentAttendanceResponseDto
        {
            Id = result.Id,
            StudentActivityId = result.StudentActivityId,
            Date = result.Date,
            IsPresent = result.IsPresent
        };
    }
}