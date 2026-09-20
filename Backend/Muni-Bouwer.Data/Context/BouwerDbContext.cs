using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.Context;

public class BouwerDbContext : DbContext
{
    public BouwerDbContext(DbContextOptions<BouwerDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Alumno> Alumnos { get; set; }
    public DbSet<Docente> Docentes { get; set; }
    public DbSet<Coordinador> Coordinadores { get; set; }
    public DbSet<Rol> Roles { get; set; }
    public DbSet<Permiso> Permisos { get; set; }
    public DbSet<Actividad> Actividades { get; set; }
    public DbSet<DocenteActividad> DocenteActividades { get; set; }
    public DbSet<AlumnoActividad> AlumnoActividades { get; set; }
    public DbSet<Inscripcion> Inscripciones { get; set; }
    public DbSet<Documentacion> Documentaciones { get; set; }
    public DbSet<FichaMedica> FichasMedicas { get; set; }
    public DbSet<AsistenciaAlumno> AsistenciasAlumnos { get; set; }
    public DbSet<AsistenciaDocente> AsistenciasDocentes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Usuario>()
            .HasDiscriminator<string>("TipoUsuario")
            .HasValue<Alumno>("Alumno")
            .HasValue<Docente>("Docente")
            .HasValue<Coordinador>("Coordinador");

        modelBuilder.Entity<Usuario>()
            .HasMany(usuario => usuario.Roles)
            .WithMany(rol => rol.Usuarios)
            .UsingEntity(tabla => tabla.ToTable("UsuariosRoles"));

        modelBuilder.Entity<Rol>()
            .HasMany(rol => rol.Permisos)
            .WithMany(permiso => permiso.Roles)
            .UsingEntity(tabla => tabla.ToTable("RolesPermisos"));

        modelBuilder.Entity<Actividad>()
            .Property(actividad => actividad.Categoria)
            .HasConversion<string>();

        modelBuilder.Entity<DocenteActividad>()
            .HasOne(relacion => relacion.Docente)
            .WithMany(docente => docente.DocenteActividades)
            .HasForeignKey(relacion => relacion.IdDocente);

        modelBuilder.Entity<DocenteActividad>()
            .HasOne(relacion => relacion.Actividad)
            .WithMany(actividad => actividad.DocenteActividades)
            .HasForeignKey(relacion => relacion.IdActividad);

        modelBuilder.Entity<AlumnoActividad>()
            .HasOne(relacion => relacion.Alumno)
            .WithMany(alumno => alumno.AlumnoActividades)
            .HasForeignKey(relacion => relacion.IdAlumno);

        modelBuilder.Entity<AlumnoActividad>()
            .HasOne(relacion => relacion.Actividad)
            .WithMany(actividad => actividad.AlumnoActividades)
            .HasForeignKey(relacion => relacion.IdActividad);

        modelBuilder.Entity<Inscripcion>()
            .HasOne(inscripcion => inscripcion.AlumnoActividad)
            .WithMany(relacion => relacion.Inscripciones)
            .HasForeignKey(inscripcion => inscripcion.IdAlumnoActividad);

        modelBuilder.Entity<Documentacion>()
            .HasOne(documentacion => documentacion.Alumno)
            .WithMany(alumno => alumno.Documentaciones)
            .HasForeignKey(documentacion => documentacion.IdAlumno);

        modelBuilder.Entity<FichaMedica>()
            .HasOne(ficha => ficha.Alumno)
            .WithOne(alumno => alumno.FichaMedica)
            .HasForeignKey<FichaMedica>(ficha => ficha.IdAlumno);

        modelBuilder.Entity<AsistenciaAlumno>()
            .HasOne(asistencia => asistencia.AlumnoActividad)
            .WithMany(relacion => relacion.Asistencias)
            .HasForeignKey(asistencia => asistencia.IdAlumnoActividad);

        modelBuilder.Entity<AsistenciaDocente>()
            .HasOne(asistencia => asistencia.DocenteActividad)
            .WithMany(relacion => relacion.Asistencias)
            .HasForeignKey(asistencia => asistencia.IdDocenteActividad);
    }
}
