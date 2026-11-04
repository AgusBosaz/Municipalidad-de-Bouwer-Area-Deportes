using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class PermissionService
{
    private readonly PermissionDAL _permissionDAL;

    public PermissionService(PermissionDAL permissionDAL)
    {
        _permissionDAL = permissionDAL;
    }

    public async Task<List<PermissionResponseDto>> GetAllAsync()
    {
        List<Permission> permissions =
            await _permissionDAL.GetAllAsync();

        return permissions
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<List<PermissionResponseDto>> GetInactiveAsync()
    {
        List<Permission> permissions =
            await _permissionDAL.GetInactiveAsync();

        return permissions
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<PermissionResponseDto?> GetByIdAsync(int id)
    {
        Permission? permission =
            await _permissionDAL.GetByIdAsync(id);

        return permission is null
            ? null
            : MapToResponse(permission);
    }
    public async Task<PermissionOperationResultDto> CreateAsync(
    CreatePermissionDto request)
    {
        string normalizedName =
            request.Name.Trim().ToLowerInvariant();

        bool nameExists =
            await _permissionDAL.NameExistsAsync(normalizedName);

        if (nameExists)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.DuplicateName
            };
        }

        Permission permission = new()
        {
            Name = normalizedName,
            Description = request.Description.Trim(),
            IsActive = true
        };

        await _permissionDAL.AddAsync(permission);
        await _permissionDAL.SaveChangesAsync();

        return new PermissionOperationResultDto
        {
            Status = PermissionOperationStatus.Success,
            Permission = MapToResponse(permission)
        };
    }

    public async Task<PermissionOperationResultDto> UpdateAsync(
    int id,
    UpdatePermissionDto request)
    {
        Permission? permission =
            await _permissionDAL.GetByIdAsync(id);

        if (permission is null)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.NotFound
            };
        }

        string normalizedName =
            request.Name.Trim().ToLowerInvariant();

        bool nameExists =
            await _permissionDAL.NameExistsAsync(
                normalizedName,
                id);

        if (nameExists)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.DuplicateName
            };
        }

        permission.Name = normalizedName;
        permission.Description = request.Description.Trim();

        await _permissionDAL.SaveChangesAsync();

        return new PermissionOperationResultDto
        {
            Status = PermissionOperationStatus.Success,
            Permission = MapToResponse(permission)
        };
    }

    public async Task<PermissionOperationResultDto> DeactivateAsync(int id)
    {
        Permission? permission =
            await _permissionDAL.GetByIdAsync(id);

        if (permission is null)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.NotFound
            };
        }

        if (permission.Roles.Count > 0)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.PermissionInUse
            };
        }

        _permissionDAL.Deactivate(permission);
        await _permissionDAL.SaveChangesAsync();

        return new PermissionOperationResultDto
        {
            Status = PermissionOperationStatus.Success,
            Permission = MapToResponse(permission)
        };
    }

    public async Task<PermissionOperationResultDto> ReactivateAsync(int id)
    {
        Permission? permission =
            await _permissionDAL.GetByIdIncludingInactiveAsync(id);

        if (permission is null)
        {
            return new PermissionOperationResultDto
            {
                Status = PermissionOperationStatus.NotFound
            };
        }

        _permissionDAL.Activate(permission);
        await _permissionDAL.SaveChangesAsync();

        return new PermissionOperationResultDto
        {
            Status = PermissionOperationStatus.Success,
            Permission = MapToResponse(permission)
        };
    }

    private static PermissionResponseDto MapToResponse(
        Permission permission)
    {
        return new PermissionResponseDto
        {
            Id = permission.Id,
            Name = permission.Name,
            Description = permission.Description,
            IsActive = permission.IsActive
        };
    }
}