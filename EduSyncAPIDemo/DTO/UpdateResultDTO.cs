using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class UpdateResultDTO
    {
        [Required]
        public Guid ResultId { get; set; }

        [Required]
        public Guid AssessmentId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public DateTime AttemptDate { get; set; }
    }
}
