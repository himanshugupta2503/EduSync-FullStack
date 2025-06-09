using System;
using System.Collections.Generic;

namespace EduSyncAPIDemo.Models;

public partial class Result
{
    public Guid ResultId { get; set; }

    public Guid AssessmentId { get; set; }

    public Guid UserId { get; set; }

    public int Score { get; set; }

    public DateTime AttemptDate { get; set; } = DateTime.UtcNow;

    // Navigation properties can be added here for relationships
}
