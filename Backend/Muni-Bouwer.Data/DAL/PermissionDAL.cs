using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.DAL;

public class PermissionDAL
{
    private readonly BouwerDbContext _context;

    public PermissionDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Permission>> GetAllAsync()
    {
        return await _context.Permissions
            .AsNoTracking()
            .Where(permission => permission.IsActive)
            .OrderBy(permission => permission.Name)
            .ToListAsync();
    }

    public async Task<List<Permission>> GetInactiveAsync()
    {
        return await _context.Permissions
            .AsNoTracking()
            .Where(permission => !permission.IsActive)
            .OrderBy(permission => permission.Name)
            .ToListAsync();
    }

    public async Task<Permission?> GetByIdAsync(int id)
    {
        return await _context.Permissions
            .Include(permission => permission.Roles)
            .FirstOrDefaultAsync(permission =>
                permission.Id == id &&
                permission.IsActive);
    }

    public async Task<Permission?> GetByIdIncludingInactiveAsync(int id)
    {
        return await _context.Permissions
            .Include(permission => permission.Roles)
            .FirstOrDefaultAsync(permission => permission.Id == id);
    }

    public async Task<List<Permission>> GetActiveByIdsAsync(
        IEnumerable<int> permissionIds)
    {
        return await _context.Permissions
            .Where(permission =>
                permission.IsActive &&
                permissionIds.Contains(permission.Id))
            .ToListAsync();
    }

    public async Task<bool> NameExistsAsync(
        string name,
        int? excludedPermissionId = null)
    {
        return await _context.Permissions.AnyAsync(permission =>
            permission.Name == name &&
            (!excludedPermissionId.HasValue ||
             permission.Id != excludedPermissionId.Value));
    }

    public async Task AddAsync(Permission permission)
    {
        await _context.Permissions.AddAsync(permission);
    }

    public void Activate(Permission permission)
    {
        permission.IsActive = true;
    }

    public void Deactivate(Permission permission)
    {
        permission.IsActive = false;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}