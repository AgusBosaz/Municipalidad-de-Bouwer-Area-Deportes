using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Business.Services;

public class PasswordRecoveryService
{
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromMinutes(30);
    private readonly BouwerDbContext _context;
    private readonly PasswordService _passwordService;
    private readonly IRecoveryEmailSender _emailSender;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PasswordRecoveryService> _logger;

    public PasswordRecoveryService(
        BouwerDbContext context,
        PasswordService passwordService,
        IRecoveryEmailSender emailSender,
        IConfiguration configuration,
        ILogger<PasswordRecoveryService> logger)
    {
        _context = context;
        _passwordService = passwordService;
        _emailSender = emailSender;
        _configuration = configuration;
        _logger = logger;
    }

    public bool IsConfigured => _emailSender.IsConfigured;

    public async Task RequestAsync(string email)
    {
        string normalizedEmail = email.Trim().ToLowerInvariant();
        User? user = await _context.Users
            .FirstOrDefaultAsync(candidate =>
                (candidate is Coordinator || candidate is Instructor) &&
                candidate.IsActive &&
                candidate.PasswordHash != null &&
                candidate.Email == normalizedEmail);

        // The response must not reveal whether the address belongs to an account.
        if (user is null)
            return;

        DateTime now = DateTime.UtcNow;
        bool recentlyRequested = await _context.PasswordResetTokens.AnyAsync(reset =>
            reset.UserId == user.Id && reset.UsedAtUtc == null &&
            reset.ExpiresAtUtc > now.Add(TokenLifetime).AddMinutes(-1));
        if (recentlyRequested)
            return;

        string token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        PasswordResetToken reset = new()
        {
            UserId = user.Id,
            TokenHash = HashToken(token),
            EmailAtIssue = normalizedEmail,
            CredentialVersionAtIssue = user.CredentialVersion,
            ExpiresAtUtc = now.Add(TokenLifetime)
        };

        _context.PasswordResetTokens.Add(reset);
        await _context.SaveChangesAsync();

        string frontendBaseUrl = _configuration["Frontend:BaseUrl"]!.TrimEnd('/');
        string resetUrl = $"{frontendBaseUrl}/restablecer-contrasena#token={token}";

        try
        {
            await _emailSender.SendPasswordResetAsync(normalizedEmail, resetUrl);
        }
        catch (Exception exception)
        {
            // Do not expose account existence or reset tokens in the response or logs.
            reset.UsedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            _logger.LogError(exception, "No se pudo enviar un correo de recuperación.");
        }
    }

    public async Task<bool> ResetAsync(string token, string newPassword)
    {
        if (token.Length != 43 || token.Any(character =>
                !char.IsAsciiLetterOrDigit(character) && character != '-' && character != '_'))
            return false;

        string tokenHash = HashToken(token);
        DateTime now = DateTime.UtcNow;

        await using var transaction = await _context.Database.BeginTransactionAsync();
        int consumed = await _context.PasswordResetTokens
            .Where(reset => reset.TokenHash == tokenHash &&
                reset.UsedAtUtc == null && reset.ExpiresAtUtc > now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(reset => reset.UsedAtUtc, now));

        if (consumed != 1)
            return false;

        PasswordResetToken? resetToken = await _context.PasswordResetTokens
            .Include(reset => reset.User)
            .FirstOrDefaultAsync(reset => reset.TokenHash == tokenHash);

        User? user = resetToken?.User;
        if (user is null || !user.IsActive || user is Student ||
            !string.Equals(user.Email, resetToken!.EmailAtIssue,
                StringComparison.OrdinalIgnoreCase) ||
            user.CredentialVersion != resetToken.CredentialVersionAtIssue)
            return false;

        user.PasswordHash = _passwordService.HashPassword(user, newPassword);
        user.MustChangePassword = false;
        user.CredentialVersion++;
        user.UpdatedAt = DateOnly.FromDateTime(now);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();
        return true;
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
