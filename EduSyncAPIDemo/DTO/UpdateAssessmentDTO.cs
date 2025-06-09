using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class UpdateAssessmentDTO
    {
        [Required]
        public Guid AssessmentId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Questions { get; set; } = string.Empty;

        [Required]
        public int MaxScore { get; set; }
    }
}
