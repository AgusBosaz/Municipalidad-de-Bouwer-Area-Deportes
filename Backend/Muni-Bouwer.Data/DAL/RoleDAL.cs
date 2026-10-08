using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class RoleDAL
{
    private readonly BouwerDbContext _context;

    public RoleDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Role>> GetAllAsync()
    {
        return await _context.Roles
            .AsNoTracking()
            .Include(role => role.Permissions)
            .OrderBy(role => role.Name)
            .ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _context.Roles
            .Include(role => role.Permissions)
            .Include(role => role.Users)
            .FirstOrDefaultAsync(role => role.Id == id);
    }

    public async Task<bool> NameExistsAsync(
        string name,
        int? excludedRoleId = null)
    {
        return await _context.Roles.AnyAsync(role =>
            role.Name == name &&
            (!excludedRoleId.HasValue ||
             role.Id != excludedRoleId.Value));
    }

    public async Task AddAsync(Role role)
    {
        await _context.Roles.AddAsync(role);
    }

    public void Delete(Role role)
    {
        _context.Roles.Remove(role);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
