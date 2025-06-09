using System;
using System.Collections.Generic;

namespace EduSyncAPIDemo.Models;

public partial class User
{
    public Guid UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = "Student";

    public string PasswordHash { get; set; } = string.Empty;

    // Navigation properties can be added here for relationships
}
