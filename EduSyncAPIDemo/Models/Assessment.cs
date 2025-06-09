using System;
using System.Collections.Generic;

namespace EduSyncAPIDemo.Models;

public partial class Assessment
{
    public Guid AssessmentId { get; set; }

    public Guid CourseId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Questions { get; set; } = string.Empty;

    public int MaxScore { get; set; } = 100;

    // Navigation properties can be added here for relationships
}
