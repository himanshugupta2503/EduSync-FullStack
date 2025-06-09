using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class GetAssessmentDTO
    {
        public Guid AssessmentId { get; set; }
        public Guid CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Questions { get; set; } = string.Empty;
        public int MaxScore { get; set; }
    }
}
