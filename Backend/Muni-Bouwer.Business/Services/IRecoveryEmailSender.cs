namespace Muni_Bouwer.Business.Services;

public interface IRecoveryEmailSender
{
    bool IsConfigured { get; }
    Task SendPasswordResetAsync(string recipient, string resetUrl);
}
