using System;
//using System.ComponentModel.DataAnnotations;

//namespace EduSyncAPIDemo.DTO
//{
//    public class LoginDTO
//    {
//        public string Email { get; set; } = string.Empty;
//        public string Password { get; set; } = string.Empty;
//    }
//}


using System.ComponentModel.DataAnnotations;

namespace EduSyncAPIDemo.DTO
{
    public class LoginDTO
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}