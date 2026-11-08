using System.Security.Cryptography;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class CoordinatorService(CoordinatorDAL coordinatorDal, RoleDAL roleDal, PasswordService passwordService)
{
    public async Task<List<CoordinatorListDto>> GetActiveAsync()
    {
        var coordinators = await coordinatorDal.GetActiveAsync();
        return coordinators.Select(coordinator => new CoordinatorListDto
        {
            Id = coordinator.Id,
            FirstName = coordinator.FirstName,
            LastName = coordinator.LastName,
            Dni = coordinator.Dni,
            Email = coordinator.Email
        }).ToList();
    }

    public async Task<CreateCoordinatorResponseDto?> CreateAsync(CreateCoordinatorDto dto)
    {
        var dni = dto.Dni.Trim();
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await coordinatorDal.ExistsByDniAsync(dni) || await coordinatorDal.ExistsByEmailAsync(email))
            return null;

        var role = await roleDal.GetByNameAsync(RoleNames.Coordinator)
            ?? throw new InvalidOperationException("El rol coordinador no existe o está inactivo.");
        var now = DateOnly.FromDateTime(DateTime.UtcNow);
        var temporaryPassword = Convert.ToBase64String(RandomNumberGenerator.GetBytes(18))
            .Replace('+', '-').Replace('/', '_');
        var coordinator = new Coordinator
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Dni = dni,
            Email = email,
            Gender = dto.Gender.Trim(),
            PhoneNumber = dto.PhoneNumber.Trim(),
            Address = dto.Address.Trim(),
            BirthDate = dto.BirthDate,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true,
            MustChangePassword = true
        };
        coordinator.PasswordHash = passwordService.HashPassword(coordinator, temporaryPassword);
        coordinator.Roles.Add(role);
        try
        {
            await coordinatorDal.AddAsync(coordinator);
        }
        catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
        {
            return null;
        }
        return new CreateCoordinatorResponseDto
        {
            Id = coordinator.Id,
            FullName = $"{coordinator.FirstName} {coordinator.LastName}",
            Dni = coordinator.Dni,
            TemporaryPassword = temporaryPassword
        };
    }
}
