using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class RoleService
{
    private readonly RoleDAL _roleDAL;

    public RoleService(RoleDAL roleDAL)
    {
        _roleDAL = roleDAL;
    }

    public async Task<List<RoleResponseDto>> GetAllAsync()
    {
        List<Role> roles = await _roleDAL.GetAllAsync();

        return roles
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<RoleResponseDto?> GetByIdAsync(int id)
    {
        Role? role = await _roleDAL.GetByIdAsync(id);

        return role is null
            ? null
            : MapToResponse(role);
    }

    public async Task<RoleOperationResultDto> CreateAsync(CreateRoleDto request)
    {
        string normalizedName = request.Name.Trim();

        bool nameExists = await _roleDAL.NameExistsAsync(normalizedName);

        if (nameExists)
        {
            return new RoleOperationResultDto
            {
                Status = RoleOperationStatus.DuplicateName
            };
        }

        Role role = new()
        {
            Name = normalizedName,
            Description = request.Description.Trim()
        };

        await _roleDAL.AddAsync(role);
        await _roleDAL.SaveChangesAsync();

        return new RoleOperationResultDto
        {
            Status = RoleOperationStatus.Success,
            Role = MapToResponse(role)
        };
    }

    public async Task<RoleOperationResultDto> UpdateAsync(int id, UpdateRoleDto request)
    {
        Role? role = await _roleDAL.GetByIdAsync(id);

        if (role is null)
        {
            return new RoleOperationResultDto
            {
                Status = RoleOperationStatus.NotFound
            };
        }

        string normalizedName = request.Name.Trim();

        bool nameExists = await _roleDAL.NameExistsAsync(normalizedName, id);

        if (nameExists)
        {
            return new RoleOperationResultDto
            {
                Status = RoleOperationStatus.DuplicateName
            };
        }

        role.Name = normalizedName;
        role.Description = request.Description.Trim();

        await _roleDAL.SaveChangesAsync();

        return new RoleOperationResultDto
        {
            Status = RoleOperationStatus.Success,
            Role = MapToResponse(role)
        };
    }

    public async Task<RoleOperationResultDto> DeleteAsync(int id)
    {
        Role? role = await _roleDAL.GetByIdAsync(id);

        if (role is null)
        {
            return new RoleOperationResultDto
            {
                Status = RoleOperationStatus.NotFound
            };
        }

        if (role.Users.Count > 0)
        {
            return new RoleOperationResultDto
            {
                Status = RoleOperationStatus.RoleInUse
            };
        }

        _roleDAL.Delete(role);
        await _roleDAL.SaveChangesAsync();

        return new RoleOperationResultDto
        {
            Status = RoleOperationStatus.Success,
            Role = MapToResponse(role)
        };
    }

    private static RoleResponseDto MapToResponse(Role role)
    {
        return new RoleResponseDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            Permissions = role.Permissions
                .Select(permission => permission.Name)
                .OrderBy(name => name)
                .ToList()
        };
    }
}
