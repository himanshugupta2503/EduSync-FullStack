using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class CreateResultDTO
    {
        [Required]
        public Guid AssessmentId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Score { get; set; }

        [Required]
        public DateTime AttemptDate { get; set; }
    }
}
