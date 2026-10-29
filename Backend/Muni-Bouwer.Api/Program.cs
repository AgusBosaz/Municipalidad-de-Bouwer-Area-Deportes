using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Muni_Bouwer.Business;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Data.Seed;
using Muni_Bouwer.Entities.Authorization;
using Muni_Bouwer.Entities.Models;
using Muni_Bouwer.Api.Services;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Configuración de CORS para permitir solicitudes desde el Frontend (React)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

builder.Services.AddScoped<IActivityDAL, ActivityDAL>();
builder.Services.AddScoped<IActivityService, ActivityService>();

string jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is not configured.");

string jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is not configured.");

string jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT audience is not configured.");

builder.Services.AddControllers();

builder.Services.AddDbContext<BouwerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("BouwerDatabase")));
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

builder.Services.AddScoped<InstructorDAL>();
builder.Services.AddScoped<StudentDAL>();
builder.Services.AddScoped<UserDAL>();
builder.Services.AddScoped<RoleDAL>();
builder.Services.AddScoped<PermissionDAL>();

builder.Services.AddScoped<InstructorService>();
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<EnrollmentService>();
builder.Services.AddScoped<DocumentService>();
builder.Services.AddScoped<MedicalRecordService>();
builder.Services.AddScoped<RoleService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<PasswordRecoveryService>();
builder.Services.AddHttpClient<IRecoveryEmailSender, MailjetRecoveryEmailSender>();
builder.Services.AddScoped<PermissionService>();

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("password-recovery", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                string? userIdValue = context.Principal?
                    .FindFirstValue(ClaimTypes.NameIdentifier);

                if (!int.TryParse(userIdValue, out int userId))
                {
                    context.Fail("El token no contiene un usuario válido.");
                    return;
                }

                BouwerDbContext dbContext = context.HttpContext
                    .RequestServices
                    .GetRequiredService<BouwerDbContext>();

                User? currentUser = await dbContext.Users
                    .AsNoTracking()
                    .Include(user => user.Roles
                        .Where(role => role.IsActive))
                    .ThenInclude(role => role.Permissions
                        .Where(permission => permission.IsActive))
                    .FirstOrDefaultAsync(user => user.Id == userId);

                if (currentUser is null || !currentUser.IsActive)
                {
                    context.Fail("El usuario está inactivo.");
                    return;
                }

                string? credentialVersionValue = context.Principal!
                    .FindFirstValue("credential_version");
                if (!int.TryParse(credentialVersionValue, out int credentialVersion) ||
                    credentialVersion != currentUser.CredentialVersion)
                {
                    context.Fail("La contraseña cambió. Iniciá sesión nuevamente.");
                    return;
                }

                HashSet<string> currentRoles = currentUser.Roles
                    .Select(role => role.Name)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);
                HashSet<string> tokenRoles = context.Principal!
                    .FindAll(ClaimTypes.Role)
                    .Select(claim => claim.Value)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                HashSet<string> currentPermissions = currentRoles.Contains(RoleNames.Coordinator)
                    ? PermissionNames.All.ToHashSet(StringComparer.OrdinalIgnoreCase)
                    : currentUser.Roles
                        .SelectMany(role => role.Permissions)
                        .Select(permission => permission.Name)
                        .ToHashSet(StringComparer.OrdinalIgnoreCase);
                HashSet<string> tokenPermissions = context.Principal
                    .FindAll("permission")
                    .Select(claim => claim.Value)
                    .ToHashSet(StringComparer.OrdinalIgnoreCase);

                if (!currentRoles.SetEquals(tokenRoles) ||
                    !currentPermissions.SetEquals(tokenPermissions))
                {
                    context.Fail("Los permisos cambiaron. Iniciá sesión nuevamente.");
                }
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    foreach (string permission in PermissionNames.All)
    {
        options.AddPolicy(
            permission,
            policy =>
            {
                policy.RequireAuthenticatedUser();

                policy.RequireAssertion(context =>
                    context.User.IsInRole(RoleNames.Coordinator) ||
                    context.User.HasClaim(
                        "permission",
                        permission));
            });
    }
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Ingrese el token JWT."
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

var app = builder.Build();

using (IServiceScope scope = app.Services.CreateScope())
{
    BouwerDbContext context =
        scope.ServiceProvider.GetRequiredService<BouwerDbContext>();

    await RoleSeeder.SeedAsync(context);
    await PermissionSeeder.SeedAsync(context);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Habilitar CORS antes del enrutamiento y la autenticación
app.UseCors("AllowFrontend");

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();