namespace Muni_Bouwer.Entities.Authorization;

public static class RoleNames
{
    public const string Coordinator = "Coordinator";
    public const string Instructor = "Instructor";
    public const string Student = "Student";

    public static readonly IReadOnlyCollection<string> All =
    [
        Coordinator,
        Instructor,
        Student
    ];
}