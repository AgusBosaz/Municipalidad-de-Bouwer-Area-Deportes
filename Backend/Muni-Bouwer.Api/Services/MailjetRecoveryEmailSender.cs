using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Muni_Bouwer.Business.Services;

namespace Muni_Bouwer.Api.Services;

public class MailjetRecoveryEmailSender : IRecoveryEmailSender
{
    private readonly HttpClient _client;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public MailjetRecoveryEmailSender(
        HttpClient client,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        _client = client;
        _configuration = configuration;
        _environment = environment;
    }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(_configuration["Mailjet:ApiKey"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Mailjet:SecretKey"]) &&
        !string.IsNullOrWhiteSpace(_configuration["Mailjet:FromEmail"]) &&
        Uri.TryCreate(_configuration["Frontend:BaseUrl"], UriKind.Absolute, out Uri? url) &&
        (url.Scheme == Uri.UriSchemeHttps ||
            (_environment.IsDevelopment() && url.IsLoopback));

    public async Task SendPasswordResetAsync(string recipient, string resetUrl)
    {
        if (!IsConfigured)
            throw new InvalidOperationException("El envío de correos no está configurado.");

        string apiKey = _configuration["Mailjet:ApiKey"]!;
        string secretKey = _configuration["Mailjet:SecretKey"]!;

        using HttpRequestMessage request = new(
            HttpMethod.Post, "https://api.mailjet.com/v3.1/send");
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Basic",
            Convert.ToBase64String(Encoding.ASCII.GetBytes($"{apiKey}:{secretKey}")));
        request.Content = JsonContent.Create(new
        {
            Messages = new[]
            {
                new
                {
                    From = new
                    {
                        Email = _configuration["Mailjet:FromEmail"],
                        Name = _configuration["Mailjet:FromName"] ?? "Área de Deportes"
                    },
                    To = new[] { new { Email = recipient } },
                    Subject = "Restablecer contraseña - Área de Deportes",
                    TextPart = $"Recibimos una solicitud para restablecer tu contraseña. Abrí este enlace dentro de los próximos 30 minutos: {resetUrl}\n\nSi no lo solicitaste, ignorá este mensaje."
                }
            }
        });

        using HttpResponseMessage response = await _client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
            throw new HttpRequestException(
                $"Mailjet rechazó el envío: HTTP {(int)response.StatusCode}.");

        using JsonDocument result = await JsonDocument.ParseAsync(
            await response.Content.ReadAsStreamAsync());
        if (!result.RootElement.TryGetProperty("Messages", out JsonElement messages) ||
            messages.GetArrayLength() != 1 ||
            !messages[0].TryGetProperty("Status", out JsonElement status) ||
            status.GetString() != "success")
            throw new HttpRequestException("Mailjet no aceptó el correo de recuperación.");
    }
}
