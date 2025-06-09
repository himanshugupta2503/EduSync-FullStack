//using System;
//using System.ComponentModel.DataAnnotations;

//namespace EduSyncAPIDemo.DTO
//{
//    public class RegisterDTO
//    {
//        public string Name { get; set; } = string.Empty;
//        public string Email { get; set; } = string.Empty;
//        public string Role { get; set; } = "Student"; // or Instructor
//        public string Password { get; set; } = string.Empty;
//    }
//}

using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class RegisterDTO
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, RegularExpression("Student|Instructor")]
        public string Role { get; set; } = "Student";

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
