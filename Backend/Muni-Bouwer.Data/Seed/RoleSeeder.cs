using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.Seed;

public static class RoleSeeder
{
    public static async Task SeedAsync(BouwerDbContext context)
    {
        List<Role> existingRoles = await context.Roles
            .Where(role => RoleNames.All.Contains(role.Name))
            .ToListAsync();

        foreach (string roleName in RoleNames.All)
        {
            Role? existingRole = existingRoles
                .FirstOrDefault(role => role.Name == roleName);

            if (existingRole is not null)
            {
                continue;
            }

            context.Roles.Add(new Role
            {
                Name = roleName,
                Description = GetDescription(roleName),
                IsActive = true
            });
        }

        await context.SaveChangesAsync();
    }

    private static string GetDescription(string roleName)
    {
        return roleName switch
        {
            RoleNames.Coordinator =>
                "Administrador general de la plataforma.",

            RoleNames.Instructor =>
                "Docente responsable de actividades y asistencias.",

            RoleNames.Student =>
                "Alumno registrado en actividades deportivas.",

            _ => string.Empty
        };
    }
}