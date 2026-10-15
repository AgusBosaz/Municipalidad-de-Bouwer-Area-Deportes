using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Business.Services;

public class InstructorService
{
    private readonly InstructorDAL _instructorDAL;
    private readonly RoleDAL _roleDAL;
    private readonly PasswordService _passwordService;

    public InstructorService(InstructorDAL instructorDAL, RoleDAL roleDAL, PasswordService passwordService)
    {
        _instructorDAL = instructorDAL;
        _roleDAL = roleDAL;
        _passwordService = passwordService;

    }

    public async Task<List<InstructorResponseDto>> GetAllAsync()
    {
        var instructors = await _instructorDAL.GetAllAsync();
        return instructors.Select(ToResponseDto).ToList();
    }

    public async Task<InstructorResponseDto?> GetByIdAsync(int id)
    {
        var instructor = await _instructorDAL.GetByIdAsync(id);
        return instructor is null ? null : ToResponseDto(instructor);
    }

    public async Task<InstructorResponseDto?> CreateAsync(CreateInstructorDto dto)
    {
        if (await _instructorDAL.ExistsByDniAsync(dto.Dni))
            return null;

        var instructorRole = await _roleDAL.GetByNameAsync(RoleNames.Instructor);

        if (instructorRole is null)
        {
            throw new InvalidOperationException(
                "El rol docente no existe o está inactivo."
            );
        }

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

        instructor.PasswordHash = _passwordService.HashPassword(instructor, dto.Password);

        instructor.Roles.Add(instructorRole);

        var created = await _instructorDAL.AddAsync(instructor);
        return ToResponseDto(created);
    }

    public async Task<string?> UpdateAsync(int id, UpdateInstructorDto dto)
    {
        var existing = await _instructorDAL.GetByIdAsync(id);
        if (existing is null)
            return "notfound";

        if (await _instructorDAL.ExistsByDniAsync(dto.Dni, excludeId: id))
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

        await _instructorDAL.SaveChangesAsync();
        return null;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var existing = await _instructorDAL.GetByIdAsync(id);
        if (existing is null)
            return false;

        existing.IsActive = false;
        existing.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);
        await _instructorDAL.SaveChangesAsync();
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
