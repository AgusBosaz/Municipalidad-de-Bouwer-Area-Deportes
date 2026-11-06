namespace Muni_Bouwer.Business.Services;

using Muni_Bouwer.Entities.DTOs;

public interface IActivityService
{
    Task<List<ActivityResponseDto>> GetAllAsync();
    Task<ActivityResponseDto?> GetByIdAsync(int id);
    Task<ActivityResponseDto> CreateAsync(CreateActivityDto dto);
    Task<(bool Updated, string? Conflict)> UpdateAsync(int id, UpdateActivityDto dto);
    Task<bool> DeleteAsync(int id);
}
