namespace Muni_Bouwer.Entities.Authorization;

public static class PermissionNames
{
    public const string UsersManage = "users.manage";
    public const string RolesManage = "roles.manage";

    public const string StudentsRead = "students.read";
    public const string StudentsManage = "students.manage";

    public const string InstructorsRead = "instructors.read";
    public const string InstructorsManage = "instructors.manage";

    public const string ActivitiesRead = "activities.read";
    public const string ActivitiesManage = "activities.manage";

    public const string EnrollmentsManage = "enrollments.manage";

    public const string AttendanceRead = "attendance.read";
    public const string AttendanceRegister = "attendance.register";

    public const string DocumentsManage = "documents.manage";

    public const string MedicalRecordsRead = "medical-records.read";
    public const string MedicalRecordsManage = "medical-records.manage";

    public static readonly IReadOnlyCollection<string> All =
    [
        UsersManage,
        RolesManage,
        StudentsRead,
        StudentsManage,
        InstructorsRead,
        InstructorsManage,
        ActivitiesRead,
        ActivitiesManage,
        EnrollmentsManage,
        AttendanceRead,
        AttendanceRegister,
        DocumentsManage,
        MedicalRecordsRead,
        MedicalRecordsManage
    ];
}