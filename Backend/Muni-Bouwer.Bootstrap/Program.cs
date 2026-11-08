using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Data.Context;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using Muni_Bouwer.Entities.DTOs;
using System.Data;
using Microsoft.AspNetCore.Identity;
using Muni_Bouwer.Business.Services;
using Muni_Bouwer.Data.DAL;
using Muni_Bouwer.Data.Seed;
using Muni_Bouwer.Entities.Models;

string? conexion = Environment.GetEnvironmentVariable(
    "ConnectionStrings__BouwerDatabase"
);

if (string.IsNullOrWhiteSpace(conexion))
{
    Console.WriteLine(
        "Falta configurar la conexión a la base de datos."
    );
    Environment.ExitCode = 1;
    return;
}

try
{
    var datosConexion = new SqlConnectionStringBuilder(conexion);

    if (string.IsNullOrWhiteSpace(datosConexion.DataSource) ||
        string.IsNullOrWhiteSpace(datosConexion.InitialCatalog))
    {
        Console.WriteLine("La conexión debe indicar un servidor y una base de datos.");
        Environment.ExitCode = 1;
        return;
    }

    Console.WriteLine($"Servidor: {datosConexion.DataSource}");
    Console.WriteLine($"Base de datos: {datosConexion.InitialCatalog}");

    var opciones = new DbContextOptionsBuilder<BouwerDbContext>()
    .UseSqlServer(conexion)
    .Options;

    await using var contexto = new BouwerDbContext(opciones);

    var migracionesPendientes =
        await contexto.Database.GetPendingMigrationsAsync();

    if (migracionesPendientes.Any())
    {
        Console.WriteLine(
            "Hay migraciones pendientes. Aplicalas antes de continuar."
        );
        Environment.ExitCode = 1;
        return;
    }

    bool existeCoordinador = await contexto.Coordinators.AnyAsync();

    if (existeCoordinador)
    {
        Console.WriteLine(
            "Ya existe un coordinador. No se creará otro desde esta herramienta."
        );
        return;
    }

    Console.WriteLine("Ingresá los datos del primer coordinador.");

    Console.Write("Nombre: ");
    string nombre = Console.ReadLine() ?? "";

    Console.Write("Apellido: ");
    string apellido = Console.ReadLine() ?? "";

    Console.Write("DNI sin puntos: ");
    string dni = Console.ReadLine() ?? "";

    Console.Write("Email: ");
    string email = Console.ReadLine() ?? "";

    Console.Write("Género: ");
    string genero = Console.ReadLine() ?? "";

    Console.Write("Teléfono: ");
    string telefono = Console.ReadLine() ?? "";

    Console.Write("Dirección: ");
    string direccion = Console.ReadLine() ?? "";

    Console.Write("Fecha de nacimiento (dd/MM/aaaa): ");
    string fechaIngresada = Console.ReadLine() ?? "";

    if (!DateOnly.TryParseExact(
        fechaIngresada,
        "dd/MM/yyyy",
        CultureInfo.InvariantCulture,
        DateTimeStyles.None,
        out DateOnly fechaNacimiento))
    {
        Console.WriteLine("La fecha de nacimiento no es válida.");
        Environment.ExitCode = 1;
        return;
    }

    var datosCoordinador = new CreateCoordinatorDto
    {
        FirstName = nombre,
        LastName = apellido,
        Dni = dni,
        Email = email,
        Gender = genero,
        PhoneNumber = telefono,
        Address = direccion,
        BirthDate = fechaNacimiento
    };

    var errores = new List<ValidationResult>();

    bool datosValidos = Validator.TryValidateObject(
        datosCoordinador,
        new ValidationContext(datosCoordinador),
        errores,
        validateAllProperties: true
    );

    if (!datosValidos)
    {
        foreach (var error in errores)
        {
            Console.WriteLine(error.ErrorMessage);
        }

        Environment.ExitCode = 1;
        return;
    }

    Console.WriteLine();
    Console.WriteLine(
        $"Se creará el coordinador en la base {datosConexion.InitialCatalog}."
    );
    Console.Write("Escribí CREAR para confirmar: ");

    if (Console.ReadLine() != "CREAR")
    {
        Console.WriteLine("Operación cancelada.");
        Environment.ExitCode = 1;
        return;
    }

    await using var transaccion = await contexto.Database.BeginTransactionAsync(
        IsolationLevel.Serializable
    );

    // Volvemos a comprobarlo antes de guardar.
    if (await contexto.Coordinators.AnyAsync())
    {
        Console.WriteLine(
            "Ya existe un coordinador. No se creó ningún usuario."
        );
        return;
    }

    // Asegura que existan los roles necesarios.
    await RoleSeeder.SeedAsync(contexto);

    var servicio = new CoordinatorService(
        new CoordinatorDAL(contexto),
        new RoleDAL(contexto),
        new PasswordService(new PasswordHasher<User>())
    );

    var resultado = await servicio.CreateAsync(datosCoordinador);

    if (resultado is null)
    {
        Console.WriteLine(
            "Ya existe un usuario con ese DNI o email."
        );
        Environment.ExitCode = 1;
        return;
    }

    await transaccion.CommitAsync();

    Console.WriteLine();
    Console.WriteLine("Coordinador creado correctamente.");
    Console.WriteLine($"DNI: {resultado.Dni}");
    Console.WriteLine($"Contraseña temporal: {resultado.TemporaryPassword}");
    Console.WriteLine(
        "Guardá la contraseña ahora: no volverá a mostrarse."
    );
    Console.WriteLine(
        "El coordinador deberá cambiarla al ingresar por primera vez."
    );
}
catch (ArgumentException)
{
    Console.WriteLine(
        "La cadena de conexión tiene un formato inválido."
    );

    Environment.ExitCode = 1;
}
catch (SqlException)
{
    Console.WriteLine(
        "No se pudo acceder a SQL Server. Revisá la conexión y las credenciales."
    );

    Environment.ExitCode = 1;
}
catch (DbUpdateException)
{
    Console.WriteLine("No se pudo guardar el coordinador. Revisá el estado de la base de datos.");
    Environment.ExitCode = 1;
}
