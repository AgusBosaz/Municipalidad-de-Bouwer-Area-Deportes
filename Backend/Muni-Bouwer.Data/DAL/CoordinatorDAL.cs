using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class CoordinatorDAL(BouwerDbContext context)
{
    public Task<List<Coordinator>> GetActiveAsync() =>
        context.Coordinators.AsNoTracking()
            .Where(coordinator => coordinator.IsActive)
            .OrderBy(coordinator => coordinator.LastName)
            .ThenBy(coordinator => coordinator.FirstName)
            .ToListAsync();

    public Task<bool> ExistsByDniAsync(string dni) =>
        context.Users.AnyAsync(user => user.Dni == dni);

    public Task<bool> ExistsByEmailAsync(string email) =>
        context.Users.AnyAsync(user => (user is Coordinator || user is Instructor) && user.Email == email);

    public async Task AddAsync(Coordinator coordinator)
    {
        context.Coordinators.Add(coordinator);
        await context.SaveChangesAsync();
    }
}
