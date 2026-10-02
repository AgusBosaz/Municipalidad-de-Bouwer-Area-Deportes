using Microsoft.AspNetCore.Identity;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class PasswordService
{
    private readonly IPasswordHasher<User> _passwordHasher;

    public PasswordService(IPasswordHasher<User> passwordHasher)
    {
        _passwordHasher = passwordHasher;
    }

    public string HashPassword(User user, string password)
    {
        return _passwordHasher.HashPassword(user, password);
    }

    public bool VerifyPassword(User user, string passwordHash, string password)
    {
        PasswordVerificationResult result = _passwordHasher.VerifyHashedPassword(
                    user, passwordHash, password);

        return result != PasswordVerificationResult.Failed;
    }
}