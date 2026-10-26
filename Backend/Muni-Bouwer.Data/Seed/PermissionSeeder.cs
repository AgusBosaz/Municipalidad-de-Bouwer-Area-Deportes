using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.Seed;

public static class PermissionSeeder
{
    public static async Task SeedAsync(BouwerDbContext context)
    {
        List<Permission> existingPermissions =
            await context.Permissions
                .Where(permission =>
                    PermissionNames.All.Contains(permission.Name))
                .ToListAsync();

        foreach (string permissionName in PermissionNames.All)
        {
            Permission? existingPermission =
                existingPermissions.FirstOrDefault(permission =>
                    permission.Name == permissionName);

            if (existingPermission is not null)
            {
                continue;
            }

            context.Permissions.Add(new Permission
            {
                Name = permissionName,
                Description = GetDescription(permissionName),
                IsActive = true
            });
        }

        await context.SaveChangesAsync();

        Role? instructorRole = await context.Roles
            .Include(role => role.Permissions)
            .FirstOrDefaultAsync(role =>
                role.Name == RoleNames.Instructor && role.IsActive);
        Permission? attendancePermission = await context.Permissions
            .FirstOrDefaultAsync(permission =>
                permission.Name == PermissionNames.AttendanceRegister &&
                permission.IsActive);

        if (instructorRole is not null &&
            attendancePermission is not null &&
            !instructorRole.Permissions.Any(permission =>
                permission.Id == attendancePermission.Id))
        {
            instructorRole.Permissions.Add(attendancePermission);
            await context.SaveChangesAsync();
        }
    }

    private static string GetDescription(string permissionName)
    {
        return permissionName switch
        {
            PermissionNames.UsersManage =>
                "Permite administrar usuarios.",

            PermissionNames.RolesManage =>
                "Permite administrar roles y permisos.",

            PermissionNames.StudentsRead =>
                "Permite consultar alumnos.",

            PermissionNames.StudentsManage =>
                "Permite administrar alumnos.",

            PermissionNames.InstructorsRead =>
                "Permite consultar docentes.",

            PermissionNames.InstructorsManage =>
                "Permite administrar docentes.",

            PermissionNames.ActivitiesRead =>
                "Permite consultar actividades.",

            PermissionNames.ActivitiesManage =>
                "Permite administrar actividades.",

            PermissionNames.EnrollmentsManage =>
                "Permite administrar inscripciones.",

            PermissionNames.AttendanceRead =>
                "Permite consultar asistencias.",

            PermissionNames.AttendanceRegister =>
                "Permite registrar asistencias.",

            PermissionNames.DocumentsManage =>
                "Permite administrar documentación.",

            PermissionNames.MedicalRecordsRead =>
                "Permite consultar fichas médicas.",

            PermissionNames.MedicalRecordsManage =>
                "Permite administrar fichas médicas.",

            _ => string.Empty
        };
    }
}
