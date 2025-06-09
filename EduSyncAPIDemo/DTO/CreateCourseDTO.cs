using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class CreateCourseDTO
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid InstructorId { get; set; }

        // No validation attributes to ensure all URL types are accepted
        public string MediaUrl { get; set; } = string.Empty;
    }
}
