using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class CreateAssessmentDTO
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Questions { get; set; } = string.Empty;

        [Required]
        public int MaxScore { get; set; }
    }
}
