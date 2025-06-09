using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class GetCourseDTO
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? InstructorId { get; set; }
        public string? MediaUrl { get; set; }
    }
}
