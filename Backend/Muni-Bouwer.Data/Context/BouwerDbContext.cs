using Microsoft.EntityFrameworkCore;
using Muni_Bouwer.Entities.Models;

namespace Muni_Bouwer.Data.Context;

public class BouwerDbContext : DbContext
{
    public BouwerDbContext(DbContextOptions<BouwerDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Student> Students { get; set; }
    public DbSet<Instructor> Instructors { get; set; }
    public DbSet<Coordinator> Coordinators { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<InstructorActivity> InstructorActivities { get; set; }
    public DbSet<StudentActivity> StudentActivities { get; set; }
    public DbSet<Enrollment> Enrollments { get; set; }
    public DbSet<Documentation> Documents { get; set; }
    public DbSet<MedicalRecord> MedicalRecords { get; set; }
    public DbSet<StudentAttendance> StudentAttendances { get; set; }
    public DbSet<InstructorAttendance> InstructorAttendances { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasDiscriminator<string>("UserType")
            .HasValue<Student>("Student")
            .HasValue<Instructor>("Instructor")
            .HasValue<Coordinator>("Coordinator");

        modelBuilder.Entity<User>()
            .HasMany(user => user.Roles)
            .WithMany(role => role.Users)
            .UsingEntity(table => table.ToTable("UserRoles"));

        modelBuilder.Entity<Role>()
            .HasMany(role => role.Permissions)
            .WithMany(permission => permission.Roles)
            .UsingEntity(table => table.ToTable("RolePermissions"));

        modelBuilder.Entity<Activity>()
            .Property(activity => activity.Category)
            .HasConversion<string>();

        modelBuilder.Entity<InstructorActivity>()
            .HasOne(assignment => assignment.Instructor)
            .WithMany(instructor => instructor.InstructorActivities)
            .HasForeignKey(assignment => assignment.InstructorId);

        modelBuilder.Entity<InstructorActivity>()
            .HasOne(assignment => assignment.Activity)
            .WithMany(activity => activity.InstructorActivities)
            .HasForeignKey(assignment => assignment.ActivityId);

        modelBuilder.Entity<StudentActivity>()
            .HasOne(assignment => assignment.Student)
            .WithMany(student => student.StudentActivities)
            .HasForeignKey(assignment => assignment.StudentId);

        modelBuilder.Entity<StudentActivity>()
            .HasOne(assignment => assignment.Activity)
            .WithMany(activity => activity.StudentActivities)
            .HasForeignKey(assignment => assignment.ActivityId);

        modelBuilder.Entity<Enrollment>()
            .HasOne(enrollment => enrollment.StudentActivity)
            .WithMany(assignment => assignment.Enrollments)
            .HasForeignKey(enrollment => enrollment.StudentActivityId);

        modelBuilder.Entity<Documentation>()
            .HasOne(document => document.Student)
            .WithMany(student => student.Documents)
            .HasForeignKey(document => document.StudentId);

        modelBuilder.Entity<MedicalRecord>()
            .HasOne(record => record.Student)
            .WithOne(student => student.MedicalRecord)
            .HasForeignKey<MedicalRecord>(record => record.StudentId);

        modelBuilder.Entity<StudentAttendance>()
            .HasOne(attendance => attendance.StudentActivity)
            .WithMany(assignment => assignment.Attendances)
            .HasForeignKey(attendance => attendance.StudentActivityId);

        modelBuilder.Entity<InstructorAttendance>()
            .HasOne(attendance => attendance.InstructorActivity)
            .WithMany(assignment => assignment.Attendances)
            .HasForeignKey(attendance => attendance.InstructorActivityId);
    }
}
