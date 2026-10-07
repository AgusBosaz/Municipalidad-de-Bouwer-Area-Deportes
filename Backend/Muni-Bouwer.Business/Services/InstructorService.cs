using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class InstructorService
{
    private readonly InstructorDAL _instructorDal;

    public InstructorService(InstructorDAL instructorDal)
    {
        _instructorDal = instructorDal;
    }

    public async Task<List<InstructorResponseDto>> GetAllAsync()
    {
        var instructors = await _instructorDal.GetAllAsync();
        return instructors.Select(ToResponseDto).ToList();
    }

    public async Task<InstructorResponseDto?> GetByIdAsync(int id)
    {
        var instructor = await _instructorDal.GetByIdAsync(id);
        return instructor is null ? null : ToResponseDto(instructor);
    }

    public async Task<InstructorResponseDto?> CreateAsync(CreateInstructorDto dto)
    {
        if (await _instructorDal.ExistsByDniAsync(dto.Dni))
            return null;

        var now = DateOnly.FromDateTime(DateTime.UtcNow);

        var instructor = new Instructor
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Dni = dto.Dni,
            Gender = dto.Gender,
            PhoneNumber = dto.PhoneNumber,
            Address = dto.Address,
            BirthDate = dto.BirthDate,
            Specialty = dto.Specialty,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };

        var created = await _instructorDal.AddAsync(instructor);
        return ToResponseDto(created);
    }

    public async Task<string?> UpdateAsync(int id, UpdateInstructorDto dto)
    {
        var existing = await _instructorDal.GetByIdAsync(id);
        if (existing is null)
            return "notfound";

        if (await _instructorDal.ExistsByDniAsync(dto.Dni, excludeId: id))
            return "duplicate";

        existing.FirstName = dto.FirstName;
        existing.LastName = dto.LastName;
        existing.Dni = dto.Dni;
        existing.Gender = dto.Gender;
        existing.PhoneNumber = dto.PhoneNumber;
        existing.Address = dto.Address;
        existing.BirthDate = dto.BirthDate;
        existing.Specialty = dto.Specialty;
        existing.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);

        await _instructorDal.SaveChangesAsync();
        return null;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _instructorDal.GetByIdAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);
        await _instructorDal.SaveChangesAsync();
        return true;
    }

    private static InstructorResponseDto ToResponseDto(Instructor i) => new()
    {
        Id = i.Id,
        FirstName = i.FirstName,
        LastName = i.LastName,
        Dni = i.Dni,
        Gender = i.Gender,
        PhoneNumber = i.PhoneNumber,
        Address = i.Address,
        BirthDate = i.BirthDate,
        Specialty = i.Specialty,
        IsActive = i.IsActive
    };
}
