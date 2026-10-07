namespace Muni_Bouwer.Data.DAL;

using Muni_Bouwer.Entities.Models;

public interface IActivityDAL
{
    Task<List<Activity>> GetAllAsync();
    Task<Activity?> GetByIdAsync(int id);
    Task<Activity> CreateAsync(Activity activity);
    Task<bool> UpdateAsync(Activity activity);
    Task<bool> DeleteAsync(int id);
}