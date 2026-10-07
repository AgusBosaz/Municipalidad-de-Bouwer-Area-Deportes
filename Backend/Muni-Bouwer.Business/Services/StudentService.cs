using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class StudentService
{
    private readonly StudentDAL _studentDAL;

    public StudentService(StudentDAL studentDAL)
    {
        _studentDAL = studentDAL;
    }

    public List<Student> GetAll()
    {
        return _studentDAL.GetAll();
    }

    public Student? GetById(int id)
    {
        return _studentDAL.GetById(id);
    }

    public Student Create(StudentCreateDTO data)
    {
        Student student = new Student
        {
            FirstName = data.FirstName,
            LastName = data.LastName,
            Dni = data.Dni,
            Gender = data.Gender,
            PhoneNumber = data.PhoneNumber,
            Address = data.Address,
            BirthDate = data.BirthDate,
            CreatedAt = DateOnly.FromDateTime(DateTime.Now),
            UpdatedAt = DateOnly.FromDateTime(DateTime.Now),
            IsActive = true,
            EmergencyContactName = data.EmergencyContactName,
            EmergencyContactPhoneNumber = data.EmergencyContactPhoneNumber
        };

        return _studentDAL.Create(student);
    }

    public bool Update(int id, StudentUpdateDTO data)
    {
        Student? student = _studentDAL.GetById(id);

        if (student == null)
        {
            return false;
        }

        student.FirstName = data.FirstName;
        student.LastName = data.LastName;
        student.Dni = data.Dni;
        student.Gender = data.Gender;
        student.PhoneNumber = data.PhoneNumber;
        student.Address = data.Address;
        student.BirthDate = data.BirthDate;
        student.EmergencyContactName = data.EmergencyContactName;
        student.EmergencyContactPhoneNumber = data.EmergencyContactPhoneNumber;
        student.UpdatedAt = DateOnly.FromDateTime(DateTime.Now);

        return _studentDAL.Update(student);
    }
}