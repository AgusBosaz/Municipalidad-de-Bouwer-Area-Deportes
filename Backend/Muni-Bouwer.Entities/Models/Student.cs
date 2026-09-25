namespace Muni_Bouwer.Entities.Models;

public class Student : User
{
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhoneNumber { get; set; } = string.Empty;

    public List<Documentation> Documents { get; set; } = new();
    public MedicalRecord? MedicalRecord { get; set; }
    public List<StudentActivity> StudentActivities { get; set; } = new();
}
