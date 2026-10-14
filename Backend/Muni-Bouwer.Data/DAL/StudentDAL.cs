using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class StudentDAL
{
    private readonly BouwerDbContext _context;

    public StudentDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public List<Student> GetAll()
    {
        return _context.Students.ToList();
    }

    public Student? GetById(int id)
    {
        return _context.Students
            .FirstOrDefault(student => student.Id == id);
    }

    public Student Create(Student student)
    {
        _context.Students.Add(student);
        _context.SaveChanges();

        return student;
    }

    public bool Update(Student student)
    {
        _context.Students.Update(student);

        return _context.SaveChanges() > 0;
    }
}