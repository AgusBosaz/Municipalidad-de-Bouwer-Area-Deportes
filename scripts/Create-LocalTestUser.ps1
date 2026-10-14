[CmdletBinding()]
param(
    [ValidatePattern('^[0-9]+$')]
    [string]$Dni = '99999999',

    [ValidateNotNullOrEmpty()]
    [string]$FirstName = 'Usuario',

    [ValidateNotNullOrEmpty()]
    [string]$LastName = 'Prueba',

    [switch]$SkipApiVerification
)

$ErrorActionPreference = 'Stop'

function Write-Step {
    param([string]$Message)

    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Get-PlainTextPassword {
    $passwordFromEnvironment = [Environment]::GetEnvironmentVariable(
        'MUNI_BOUWER_TEST_PASSWORD',
        'Process')

    if (-not [string]::IsNullOrWhiteSpace($passwordFromEnvironment)) {
        return $passwordFromEnvironment
    }

    $securePassword = Read-Host `
        'Ingrese una contraseña exclusiva para este usuario local' `
        -AsSecureString

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(
        $securePassword)

    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Test-ApiAvailable {
    param([string]$BaseUrl)

    try {
        Invoke-WebRequest `
            -UseBasicParsing `
            -Uri "$BaseUrl/swagger/index.html" `
            -TimeoutSec 2 | Out-Null

        return $true
    }
    catch {
        return $false
    }
}

$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$repositoryRoot = (Resolve-Path (Join-Path $scriptDirectory '..')).Path
$apiProject = Join-Path `
    $repositoryRoot `
    'Backend\Muni-Bouwer.Api\Muni-Bouwer.Api.csproj'
$solution = Join-Path $repositoryRoot 'Backend\MuniBack.sln'
$entitiesProject = Join-Path `
    $repositoryRoot `
    'Backend\Muni-Bouwer.Entities\Muni-Bouwer.Entities.csproj'
$dataProject = Join-Path `
    $repositoryRoot `
    'Backend\Muni-Bouwer.Data\Muni-Bouwer.Data.csproj'
$temporaryDirectory = Join-Path `
    ([IO.Path]::GetTempPath()) `
    "MuniBouwerLocalUser-$([Guid]::NewGuid().ToString('N'))"
$temporaryProject = Join-Path $temporaryDirectory 'LocalUserSeeder.csproj'
$temporaryProgram = Join-Path $temporaryDirectory 'Program.cs'
$apiOutput = Join-Path $temporaryDirectory 'api-output.log'
$apiError = Join-Path $temporaryDirectory 'api-error.log'
$apiBaseUrl = 'http://localhost:5218'
$apiProcess = $null
$startedApi = $false
$password = $null

try {
    Write-Step 'Comprobando archivos del proyecto'

    foreach ($requiredPath in @(
        $apiProject,
        $solution,
        $entitiesProject,
        $dataProject)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "No se encontró el archivo requerido: $requiredPath"
        }
    }

    if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
        throw 'No se encontró dotnet. Instale el SDK de .NET 8.'
    }

    Write-Step 'Comprobando User Secrets'

    $secretNames = & dotnet user-secrets list --project $apiProject

    if ($LASTEXITCODE -ne 0) {
        throw 'No se pudieron leer los User Secrets del proyecto API.'
    }

    if (-not ($secretNames -match '^ConnectionStrings:BouwerDatabase\s*=')) {
        throw 'Falta ConnectionStrings:BouwerDatabase en User Secrets.'
    }

    if (-not $SkipApiVerification -and
        -not ($secretNames -match '^Jwt:Key\s*=')) {
        throw 'Falta Jwt:Key en User Secrets.'
    }

    $password = Get-PlainTextPassword

    if ([string]::IsNullOrWhiteSpace($password)) {
        throw 'La contraseña no puede estar vacía.'
    }

    if ($password.Length -lt 8) {
        throw 'La contraseña debe tener al menos 8 caracteres.'
    }

    Write-Step 'Creando el ejecutor temporal fuera del repositorio'
    New-Item -ItemType Directory -Path $temporaryDirectory | Out-Null

    $entitiesProjectXml = [Security.SecurityElement]::Escape($entitiesProject)
    $dataProjectXml = [Security.SecurityElement]::Escape($dataProject)

    $projectContent = @"
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <UserSecretsId>50e339dd-8843-4723-985a-95b10031180b</UserSecretsId>
  </PropertyGroup>
  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
    <ProjectReference Include="$entitiesProjectXml" />
    <ProjectReference Include="$dataProjectXml" />
  </ItemGroup>
</Project>
"@

    Set-Content `
        -LiteralPath $temporaryProject `
        -Value $projectContent `
        -Encoding UTF8

    $programContent = @'
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Muni_Bouwer.Data.Context;
using Muni_Bouwer.Entities.Models;

IConfiguration configuration = new ConfigurationBuilder()
    .AddUserSecrets<Program>()
    .Build();

string connectionString = configuration
    .GetConnectionString("BouwerDatabase")
    ?? throw new InvalidOperationException(
        "ConnectionStrings:BouwerDatabase no está configurada.");

string dni = Environment.GetEnvironmentVariable("MUNI_BOUWER_TEST_DNI")
    ?? throw new InvalidOperationException("Falta el DNI temporal.");
string password = Environment.GetEnvironmentVariable(
    "MUNI_BOUWER_TEST_PASSWORD")
    ?? throw new InvalidOperationException("Falta la contraseña temporal.");
string firstName = Environment.GetEnvironmentVariable(
    "MUNI_BOUWER_TEST_FIRST_NAME") ?? "Usuario";
string lastName = Environment.GetEnvironmentVariable(
    "MUNI_BOUWER_TEST_LAST_NAME") ?? "Prueba";

DbContextOptions<BouwerDbContext> options =
    new DbContextOptionsBuilder<BouwerDbContext>()
        .UseSqlServer(connectionString)
        .Options;

await using BouwerDbContext context = new(options);

if (!await context.Database.CanConnectAsync())
{
    throw new InvalidOperationException(
        "No se pudo conectar con la base SQL Server local.");
}

Role? coordinatorRole = await context.Roles
    .FirstOrDefaultAsync(role => role.Name == "Coordinator");

if (coordinatorRole is null)
{
    coordinatorRole = new Role
    {
        Name = "Coordinator",
        Description = "Administración general de la plataforma."
    };

    context.Roles.Add(coordinatorRole);
}

User? existingUser = await context.Users
    .Include(user => user.Roles)
    .FirstOrDefaultAsync(user => user.Dni == dni);

Coordinator coordinator;
string operation;

if (existingUser is null)
{
    DateOnly today = DateOnly.FromDateTime(DateTime.UtcNow);

    coordinator = new Coordinator
    {
        FirstName = firstName,
        LastName = lastName,
        Dni = dni,
        Gender = "No especificado",
        PhoneNumber = string.Empty,
        Address = string.Empty,
        BirthDate = new DateOnly(2000, 1, 1),
        CreatedAt = today,
        UpdatedAt = today,
        IsActive = true
    };

    context.Coordinators.Add(coordinator);
    operation = "creado";
}
else if (existingUser is Coordinator existingCoordinator)
{
    coordinator = existingCoordinator;
    coordinator.IsActive = true;
    coordinator.UpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);
    operation = "actualizado";
}
else
{
    throw new InvalidOperationException(
        $"El DNI {dni} ya pertenece a un usuario que no es Coordinator.");
}

PasswordHasher<User> passwordHasher = new();
coordinator.PasswordHash = passwordHasher.HashPassword(
    coordinator,
    password);

if (!coordinator.Roles.Any(role => role.Name == "Coordinator"))
{
    coordinator.Roles.Add(coordinatorRole);
}

await context.SaveChangesAsync();

Console.WriteLine($"USER_OPERATION={operation}");
Console.WriteLine($"USER_ID={coordinator.Id}");
Console.WriteLine($"USER_DNI={coordinator.Dni}");
Console.WriteLine("USER_ROLE=Coordinator");
'@

    Set-Content `
        -LiteralPath $temporaryProgram `
        -Value $programContent `
        -Encoding UTF8

    [Environment]::SetEnvironmentVariable(
        'MUNI_BOUWER_TEST_DNI', $Dni, 'Process')
    [Environment]::SetEnvironmentVariable(
        'MUNI_BOUWER_TEST_PASSWORD', $password, 'Process')
    [Environment]::SetEnvironmentVariable(
        'MUNI_BOUWER_TEST_FIRST_NAME', $FirstName, 'Process')
    [Environment]::SetEnvironmentVariable(
        'MUNI_BOUWER_TEST_LAST_NAME', $LastName, 'Process')

    Write-Step 'Creando o actualizando el usuario en SQL Server local'
    & dotnet run --project $temporaryProject

    if ($LASTEXITCODE -ne 0) {
        throw 'El ejecutor temporal no pudo crear el usuario.'
    }

    if ($SkipApiVerification) {
        Write-Host `
            "`nUsuario local preparado. Se omitió la prueba de la API." `
            -ForegroundColor Green
        return
    }

    Write-Step 'Comprobando login y endpoint protegido'

    if (-not (Test-ApiAvailable -BaseUrl $apiBaseUrl)) {
        $apiProcess = Start-Process `
            -FilePath 'dotnet' `
            -ArgumentList @(
                'run',
                '--project',
                "`"$apiProject`"",
                '--launch-profile',
                'http') `
            -WorkingDirectory $repositoryRoot `
            -WindowStyle Hidden `
            -RedirectStandardOutput $apiOutput `
            -RedirectStandardError $apiError `
            -PassThru

        $startedApi = $true
        $deadline = (Get-Date).AddSeconds(90)

        while ((Get-Date) -lt $deadline) {
            if ($apiProcess.HasExited) {
                $errorText = if (Test-Path -LiteralPath $apiError) {
                    Get-Content -LiteralPath $apiError -Raw
                }
                else {
                    'Sin salida de error.'
                }

                throw "La API terminó antes de iniciar.`n$errorText"
            }

            if (Test-ApiAvailable -BaseUrl $apiBaseUrl) {
                break
            }

            Start-Sleep -Seconds 1
        }

        if (-not (Test-ApiAvailable -BaseUrl $apiBaseUrl)) {
            throw 'La API no respondió dentro de 90 segundos.'
        }
    }

    $loginBody = @{
        dni = $Dni
        password = $password
    } | ConvertTo-Json

    $login = Invoke-RestMethod `
        -Uri "$apiBaseUrl/api/auth/login" `
        -Method Post `
        -ContentType 'application/json' `
        -Body $loginBody

    if ([string]::IsNullOrWhiteSpace($login.token)) {
        throw 'El login no devolvió un token JWT.'
    }

    if ('Coordinator' -notin $login.roles) {
        throw 'El token no contiene el rol Coordinator.'
    }

    $headers = @{ Authorization = "Bearer $($login.token)" }
    $currentUser = Invoke-RestMethod `
        -Uri "$apiBaseUrl/api/auth/me" `
        -Method Get `
        -Headers $headers

    if ($currentUser.dni -ne $Dni) {
        throw '/api/auth/me devolvió un DNI diferente.'
    }

    if ('Coordinator' -notin $currentUser.roles) {
        throw '/api/auth/me no devolvió el rol Coordinator.'
    }

    Write-Host "`nVerificación completada correctamente:" -ForegroundColor Green
    Write-Host "  DNI: $Dni"
    Write-Host "  Nombre: $FirstName $LastName"
    Write-Host '  Rol: Coordinator'
    Write-Host '  Login: correcto'
    Write-Host '  /api/auth/me: correcto'
}
finally {
    if ($startedApi -and $null -ne $apiProcess -and
        -not $apiProcess.HasExited) {
        & taskkill.exe /PID $apiProcess.Id /T /F 2>$null | Out-Null
    }

    foreach ($variableName in @(
        'MUNI_BOUWER_TEST_DNI',
        'MUNI_BOUWER_TEST_PASSWORD',
        'MUNI_BOUWER_TEST_FIRST_NAME',
        'MUNI_BOUWER_TEST_LAST_NAME')) {
        [Environment]::SetEnvironmentVariable(
            $variableName, $null, 'Process')
    }

    $password = $null

    if (Test-Path -LiteralPath $temporaryDirectory) {
        $resolvedTemporaryDirectory =
            (Resolve-Path -LiteralPath $temporaryDirectory).Path
        $resolvedSystemTemp =
            (Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path

        if ($resolvedTemporaryDirectory.StartsWith(
            $resolvedSystemTemp,
            [StringComparison]::OrdinalIgnoreCase)) {
            Remove-Item `
                -LiteralPath $resolvedTemporaryDirectory `
                -Recurse `
                -Force
        }
    }
}
