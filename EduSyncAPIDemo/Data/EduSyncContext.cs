using System;
using EduSyncAPIDemo.Models;
using Microsoft.EntityFrameworkCore;

namespace EduSyncAPIDemo.Data
{
    public partial class EduSyncContext : DbContext
    {
        public EduSyncContext()
        {
        }

        public EduSyncContext(DbContextOptions<EduSyncContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Assessment> Assessments { get; set; }
        public virtual DbSet<Course> Courses { get; set; }
        public virtual DbSet<Result> Results { get; set; }
        public virtual DbSet<User> Users { get; set; }

     //   protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
       // {
//#warning Move connection string to appsettings.json for security
      //      if (!optionsBuilder.IsConfigured)
    //        {
  //              optionsBuilder.UseSqlServer("Server=LAPTOP-0ESIB2PT;Database=EduSyncDBDemo;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True;");
//            }
     //   }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Assessment>(entity =>
            {
                entity.HasKey(e => e.AssessmentId);

                entity.Property(e => e.AssessmentId)
                    .ValueGeneratedNever()
                    .HasColumnName("AssessmentID");

                entity.Property(e => e.CourseId).HasColumnName("CourseID");

                entity.Property(e => e.Title)
                    .HasMaxLength(100);

                entity.Property(e => e.Questions)
                    .HasColumnType("nvarchar(MAX)");

                entity.Property(e => e.MaxScore);

                // FK: Assessment -> Course
                entity.HasOne<Course>()
                    .WithMany()
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasKey(e => e.CourseId);

                entity.Property(e => e.CourseId)
                    .ValueGeneratedNever()
                    .HasColumnName("CourseID");

                entity.Property(e => e.Title)
                    .HasMaxLength(100);

                entity.Property(e => e.Description)
                    .HasMaxLength(500);

                entity.Property(e => e.InstructorId)
                    .HasColumnName("InstructorID");

                entity.Property(e => e.MediaUrl)
                    .HasMaxLength(200);

                // FK: Course -> User (Instructor)
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(e => e.InstructorId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Result>(entity =>
            {
                entity.HasKey(e => e.ResultId);

                entity.Property(e => e.ResultId)
                    .ValueGeneratedNever()
                    .HasColumnName("ResultID");

                entity.Property(e => e.AssessmentId)
                    .HasColumnName("AssessmentID");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID");

                entity.Property(e => e.Score);

                entity.Property(e => e.AttemptDate)
                    .HasColumnType("datetime");

                // FK: Result -> Assessment
                entity.HasOne<Assessment>()
                    .WithMany()
                    .HasForeignKey(e => e.AssessmentId)
                    .OnDelete(DeleteBehavior.Cascade);

                // FK: Result -> User
                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.UserId)
                    .ValueGeneratedNever()
                    .HasColumnName("UserID");

                entity.Property(e => e.Name)
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .HasMaxLength(100);

                entity.Property(e => e.Role)
                    .HasMaxLength(50);

                entity.Property(e => e.PasswordHash)
                .HasMaxLength(200); // ✅ Increase to at least 100–200 chars

            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
