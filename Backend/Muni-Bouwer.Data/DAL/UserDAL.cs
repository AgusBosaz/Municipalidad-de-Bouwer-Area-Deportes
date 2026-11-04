using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class UserDAL
{
    private readonly BouwerDbContext _context;

    public UserDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByDniAsync(string dni)
    {
        return await _context.Users
            .AsNoTracking()
            .Include(user => user.Roles
                .Where(role => role.IsActive))
            .ThenInclude(role => role.Permissions
                .Where(permission => permission.IsActive))
            .FirstOrDefaultAsync(user => user.Dni == dni);
    }

    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .Include(user => user.Roles)
            .OrderBy(user => user.LastName)
            .ThenBy(user => user.FirstName)
            .ToListAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(user => user.Roles)
            .FirstOrDefaultAsync(user => user.Id == id);
    }

    public async Task<List<Role>> GetActiveRolesByIdsAsync(
        IEnumerable<int> roleIds)
    {
        return await _context.Roles
            .Where(role =>
                role.IsActive &&
                roleIds.Contains(role.Id))
            .ToListAsync();
    }

    public void Activate(User user)
    {
        user.IsActive = true;
        user.UpdatedAt = DateOnly.FromDateTime(DateTime.Today);
    }

    public void Deactivate(User user)
    {
        user.IsActive = false;
        user.UpdatedAt = DateOnly.FromDateTime(DateTime.Today);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
