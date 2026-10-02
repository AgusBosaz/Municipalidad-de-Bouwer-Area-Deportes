using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Entities.DTOs;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class AuthService
{
    private readonly UserDAL _userDal;
    private readonly PasswordService _passwordService;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserDAL userDAL,
        PasswordService passwordService,
        IConfiguration configuration)
    {
        _userDal = userDAL;
        _passwordService = passwordService;
        _configuration = configuration;
    }

    public async Task<LoginResultDto> LoginAsync(LoginRequestDto request)
    {
        User? user = await _userDal.GetByDniAsync(request.Dni.Trim());

        if (user is null ||
            user is Student ||
            string.IsNullOrWhiteSpace(user.PasswordHash))
        {
            return new LoginResultDto
            {
                Status = LoginResultStatus.InvalidCredentials
            };
        }

        bool isPasswordValid = _passwordService.VerifyPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (!isPasswordValid)
        {
            return new LoginResultDto
            {
                Status = LoginResultStatus.InvalidCredentials
            };
        }

        if (!user.IsActive)
        {
            return new LoginResultDto
            {
                Status = LoginResultStatus.InactiveUser
            };
        }

        return CreateSuccessfulResult(user);
    }

    private LoginResultDto CreateSuccessfulResult(User user)
    {
        string key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");

        string issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is not configured.");

        string audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is not configured.");

        if (!int.TryParse(
            _configuration["Jwt:ExpirationMinutes"],
            out int expirationMinutes) || expirationMinutes <= 0)
        {
            throw new InvalidOperationException(
                "JWT expiration is not configured correctly.");
        }

        DateTime expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        List<Claim> claims =
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim("dni", user.Dni)
            ];

        foreach (Role role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role.Name));
        }

        SymmetricSecurityKey securityKey =
            new(Encoding.UTF8.GetBytes(key));

        SigningCredentials credentials = new(securityKey, SecurityAlgorithms.HmacSha256);

        JwtSecurityToken token = new(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        string serializedToken = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResultDto
        {
            Status = LoginResultStatus.Success,
            Response = new LoginResponseDto
            {
                Token = serializedToken,
                ExpiresAt = expiresAt,
                UserId = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                Roles = user.Roles
                    .Select(role => role.Name)
                    .ToList()
            }
        };
    }
}
