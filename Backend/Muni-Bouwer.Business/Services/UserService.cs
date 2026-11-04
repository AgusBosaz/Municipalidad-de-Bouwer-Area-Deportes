using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Entities.Authorization;

namespace Muni_Bouwer.Business.Services;

public class UserService
{
    private readonly UserDAL _userDAL;

    public UserService(UserDAL userDAL)
    {
        _userDAL = userDAL;
    }

    public async Task<List<UserResponseDto>> GetAllAsync()
    {
        List<User> users = await _userDAL.GetAllAsync();

        return users
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        User? user = await _userDAL.GetByIdAsync(id);

        return user is null
            ? null
            : MapToResponse(user);
    }

    public async Task<UserOperationResultDto> ActivateAsync(int id)
    {
        User? user = await _userDAL.GetByIdAsync(id);

        if (user is null)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.NotFound
            };
        }

        _userDAL.Activate(user);
        await _userDAL.SaveChangesAsync();

        return new UserOperationResultDto
        {
            Status = UserOperationStatus.Success,
            User = MapToResponse(user)
        };
    }

    public async Task<UserOperationResultDto> DeactivateAsync(int id, int currentUserId)
    {
        if (id == currentUserId)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.CannotDeactivateCurrentUser
            };
        }

        User? user = await _userDAL.GetByIdAsync(id);

        if (user is null)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.NotFound
            };
        }

        _userDAL.Deactivate(user);
        await _userDAL.SaveChangesAsync();

        return new UserOperationResultDto
        {
            Status = UserOperationStatus.Success,
            User = MapToResponse(user)
        };
    }

    public async Task<UserOperationResultDto> UpdateRolesAsync(int id, int currentUserId, UpdateUserRolesDto request)
    {
        if (id == currentUserId)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.CannotModifyCurrentUserRoles
            };
        }

        User? user = await _userDAL.GetByIdAsync(id);

        if (user is null)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.NotFound
            };
        }

        List<int> requestedRoleIds = request.RoleIds
            .Distinct()
            .ToList();

        List<Role> roles = await _userDAL.GetActiveRolesByIdsAsync(requestedRoleIds);

        if (roles.Count != requestedRoleIds.Count)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.InvalidRoles
            };
        }

        bool hasIncompatibleRoles = user switch
        {
            Student => roles.Count != 1 ||
                       roles[0].Name != RoleNames.Student,

            Instructor => roles.Count != 1 ||
                          roles[0].Name != RoleNames.Instructor,

            Coordinator => roles.Count != 1 ||
                           roles[0].Name != RoleNames.Coordinator,

            _ => true
        };

        if (hasIncompatibleRoles)
        {
            return new UserOperationResultDto
            {
                Status = UserOperationStatus.IncompatibleRoles
            };
        }

        user.Roles.Clear();

        foreach (Role role in roles)
        {
            user.Roles.Add(role);
        }

        user.UpdatedAt = DateOnly.FromDateTime(DateTime.Today);

        await _userDAL.SaveChangesAsync();

        return new UserOperationResultDto
        {
            Status = UserOperationStatus.Success,
            User = MapToResponse(user)
        };
    }

    private static UserResponseDto MapToResponse(User user)
    {
        string userType = user switch
        {
            Coordinator => RoleNames.Coordinator,
            Instructor => RoleNames.Instructor,
            Student => RoleNames.Student,
            _ => "User"
        };

        return new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Dni = user.Dni,
            UserType = userType,
            IsActive = user.IsActive,
            Roles = user.Roles
                .Select(role => role.Name)
                .OrderBy(roleName => roleName)
                .ToList()
        };
    }
}