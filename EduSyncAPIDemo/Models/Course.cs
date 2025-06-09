using System;
using System.Collections.Generic;

namespace EduSyncAPIDemo.Models;

public partial class Course
{
    public Guid CourseId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid InstructorId { get; set; }

    public string MediaUrl { get; set; } = string.Empty;

    // Navigation properties can be added here for relationships
}
