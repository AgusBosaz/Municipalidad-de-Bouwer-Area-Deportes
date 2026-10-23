using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Business.Services;

public class StudentService
{
    private readonly StudentDAL _studentDAL;
    private readonly RoleDAL _roleDAL;

    public StudentService(StudentDAL studentDAL, RoleDAL roleDAL)
    {
        _studentDAL = studentDAL;
        _roleDAL = roleDAL;
    }

    public async Task<List<StudentResponseDto>> GetAllAsync()
    {
        List<Student> students = await _studentDAL.GetAllAsync();
        return students.Select(ToResponseDto).ToList();
    }

    public async Task<StudentResponseDto?> GetByIdAsync(int id)
    {
        Student? student = await _studentDAL.GetByIdAsync(id);
        return student is null ? null : ToResponseDto(student);
    }

    public async Task<StudentResponseDto?> CreateAsync(StudentCreateDTO data)
    {
        if (await _studentDAL.ExistsByDniAsync(data.Dni))
        {
            return null;
        }

        Role? studentRole = await _roleDAL.GetByNameAsync(RoleNames.Student);

        if (studentRole is null)
        {
            throw new InvalidOperationException(
                "El rol estudiante no existe o está inactivo.");
        }

        DateOnly now = DateOnly.FromDateTime(DateTime.UtcNow);

        Student student = new Student
        {
            FirstName = data.FirstName,
            LastName = data.LastName,
            Dni = data.Dni,
            Email = string.IsNullOrWhiteSpace(data.Email)
                ? null : data.Email.Trim().ToLowerInvariant(),
            Gender = data.Gender,
            PhoneNumber = data.PhoneNumber,
            Address = data.Address,
            BirthDate = data.BirthDate,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true,
            EmergencyContactName = data.EmergencyContactName,
            EmergencyContactPhoneNumber = data.EmergencyContactPhoneNumber
        };

        student.Roles.Add(studentRole);

        Student created = await _studentDAL.CreateAsync(student);
        return ToResponseDto(created);
    }

    public async Task<bool> UpdateAsync(int id, StudentUpdateDTO data)
    {
        Student? student = await _studentDAL.GetByIdAsync(id);

        if (student == null)
        {
            return false;
        }

        if (await _studentDAL.ExistsByDniAsync(data.Dni, id))
        {
            throw new InvalidOperationException("Ya existe un usuario con ese DNI.");
        }

        student.FirstName = data.FirstName;
        student.LastName = data.LastName;
        student.Dni = data.Dni;
        student.Email = string.IsNullOrWhiteSpace(data.Email)
            ? null : data.Email.Trim().ToLowerInvariant();
        student.Gender = data.Gender;
        student.PhoneNumber = data.PhoneNumber;
        student.Address = data.Address;
        student.BirthDate = data.BirthDate;
        student.EmergencyContactName = data.EmergencyContactName;
        student.EmergencyContactPhoneNumber = data.EmergencyContactPhoneNumber;
        student.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        return await _studentDAL.UpdateAsync(student);
    }

    private static StudentResponseDto ToResponseDto(Student student) => new()
    {
        Id = student.Id,
        FirstName = student.FirstName,
        LastName = student.LastName,
        Dni = student.Dni,
        Email = student.Email,
        Gender = student.Gender,
        PhoneNumber = student.PhoneNumber,
        Address = student.Address,
        BirthDate = student.BirthDate,
        EmergencyContactName = student.EmergencyContactName,
        EmergencyContactPhoneNumber = student.EmergencyContactPhoneNumber,
        IsActive = student.IsActive
    };
}
