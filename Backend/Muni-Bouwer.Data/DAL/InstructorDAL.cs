using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Data.DAL;

public class InstructorDAL
{
    private readonly BouwerDbContext _context;

    public InstructorDAL(BouwerDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ExistsByDniAsync(string dni, int? excludeId = null)
    {
        return await _context.Set<User>()
            .AnyAsync(u => u.Dni == dni && u.Id != excludeId);
    }

    public async Task<bool> ExistsByEmailAsync(string email, int? excludeId = null)
    {
        return await _context.Set<User>()
            .AnyAsync(user => (user is Instructor || user is Coordinator) &&
                user.Email == email && user.Id != excludeId);
    }

    public async Task<List<Instructor>> GetAllAsync()
    {
        return await _context.Set<Instructor>()
            .Where(i => i.IsActive)
            .ToListAsync();
    }

    public async Task<List<Instructor>> GetInactiveAsync()
    {
        return await _context.Set<Instructor>()
            .AsNoTracking()
            .Where(i => !i.IsActive)
            .ToListAsync();
    }

    public async Task<Instructor?> GetInactiveByIdAsync(int id)
    {
        return await _context.Set<Instructor>()
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id && !i.IsActive);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var changed = await _context.Set<Instructor>()
            .Where(i => i.Id == id && i.IsActive)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(i => i.IsActive, false)
                .SetProperty(i => i.UpdatedAt, now)
                .SetProperty(i => i.CredentialVersion, i => i.CredentialVersion + 1));
        if (changed == 0) return false;

        await _context.InstructorActivities
            .Where(a => a.InstructorId == id && a.IsActive)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.IsActive, false));
        await transaction.CommitAsync();
        return true;
    }

    public async Task<bool> ReactivateAsync(int id, string passwordHash)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var changed = await _context.Set<Instructor>()
            .Where(i => i.Id == id && !i.IsActive &&
                i.Roles.Any(role => role.Name == RoleNames.Instructor && role.IsActive))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(i => i.IsActive, true)
                .SetProperty(i => i.PasswordHash, passwordHash)
                .SetProperty(i => i.MustChangePassword, true)
                .SetProperty(i => i.CredentialVersion, i => i.CredentialVersion + 1)
                .SetProperty(i => i.UpdatedAt, now));
        if (changed == 0) return false;

        // Las asignaciones anteriores deben ser otorgadas nuevamente por el coordinador.
        await _context.InstructorActivities
            .Where(a => a.InstructorId == id && a.IsActive)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.IsActive, false));
        await transaction.CommitAsync();
        return true;
    }

    public async Task<Instructor?> GetByIdAsync(int id)
    {
        return await _context.Set<Instructor>()
            .FirstOrDefaultAsync(i => i.Id == id && i.IsActive);
    }

    public async Task<Instructor> AddAsync(Instructor instructor)
    {
        _context.Set<Instructor>().Add(instructor);
        await _context.SaveChangesAsync();
        return instructor;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
