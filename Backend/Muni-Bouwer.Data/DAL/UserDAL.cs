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
            .Include(user => user.Roles)
            .FirstOrDefaultAsync(user => user.Dni == dni);
    }
}