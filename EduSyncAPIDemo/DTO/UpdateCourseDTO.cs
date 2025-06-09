using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class UpdateCourseDTO
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public Guid InstructorId { get; set; }

        public string? MediaUrl { get; set; }
    }
}
