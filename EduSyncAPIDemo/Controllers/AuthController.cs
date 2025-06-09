//        //[HttpPost("register")]
//        //public async Task<IActionResult> Register(RegisterDTO dto)
//        //{
//        //    if (_context.Users.Any(u => u.Email == dto.Email))
//        //        return BadRequest("User already exists.");

//        //    var user = new User
//        //    {
//        //        UserId = Guid.NewGuid(),
//        //        Name = dto.Name,    
//        //        Email = dto.Email,
//        //        Role = dto.Role,
//        //        PasswordHash = dto.Password // Replace with real hashing in production
//        //    };

//        //    _context.Users.Add(user);
//        //    await _context.SaveChangesAsync();

//        //    return Ok("Registration successful.");
//        //}

//        //[HttpPost("register")]
//        //public async Task<IActionResult> Register(RegisterDTO dto)
//        //{
//        //    var exists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
//        //    if (exists) return BadRequest("Email already exists.");

//        //    var user = new User
//        //    {
//        //        UserId = Guid.NewGuid(),
//        //        Name = dto.Name,
//        //        Email = dto.Email,
//        //        Role = dto.Role,
//        //        PasswordHash = dto.Password // In real-world, hash this!
//        //    };

//        //    _context.Users.Add(user);
//        //    await _context.SaveChangesAsync();

//        //    //var token = _jwt.GenerateToken(user); // 🔥 Generate token here

//        //    //Return token on register
//        //    return Ok(new { token });
//        //}


//        [HttpPost("login")]
//        public async Task<IActionResult> Login(LoginDTO dto)
//        {
//            var user = await _context.Users
//                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.PasswordHash == dto.Password);

//            //if (user == null)
//            //    return Unauthorized("Invalid credentials.");

//            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
//                return Unauthorized("Invalid credentials.");


//            var token = _jwtService.GenerateToken(user);
//            return Ok(new { token });
//        }
//    }
//}

//using Microsoft.AspNetCore.Mvc;
//using EduSyncAPIDemo.Data;
//using EduSyncAPIDemo.Models;
//using EduSyncAPIDemo.DTO;
//using EduSyncAPIDemo.Services;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.AspNetCore.Authorization;

//namespace EduSyncAPIDemo.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class AuthController : ControllerBase
//    {
//        private readonly EduSyncContext _context;
//        private readonly JWTService _jwtService;

//        public AuthController(EduSyncContext context, JWTService jwtService)
//        {
//            _context = context;
//            _jwtService = jwtService;
//        }

//        [HttpPost("register")]
//        public async Task<IActionResult> Register(RegisterDTO dto)
//        {
//            // Check if user already exists
//            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
//            if (existingUser != null)
//                return BadRequest("User already exists");

//            // Hash the password securely
//            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

//            var user = new User
//            {
//                UserId = Guid.NewGuid(),
//                Name = dto.Name,
//                Email = dto.Email,
//                Role = dto.Role,
//                PasswordHash = hashedPassword
//            };

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();

//            var token = _jwtService.GenerateToken(user);

//            return Ok(new
//            {
//                token,
//                user = new
//                {
//                    user.UserId,
//                    user.Name,
//                    user.Email,
//                    user.Role
//                }
//            });
//        }

//        [HttpPost("login")]
//        public async Task<IActionResult> Login(LoginDTO dto)
//        {
//            // Find user by email
//            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
//            if (user == null)
//                return Unauthorized("Invalid credentials.");

//            // Verify password using BCrypt
//            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
//            if (!isPasswordValid)
//                return Unauthorized("Invalid credentials.");

//            var token = _jwtService.GenerateToken(user);

//            return Ok(new
//            {
//                token,
//                user = new
//                {
//                    user.UserId,
//                    user.Name,
//                    user.Email,
//                    user.Role
//                }
//            });
//        }
//    }
//}

using Microsoft.AspNetCore.Mvc;
using EduSyncAPIDemo.Data;
using EduSyncAPIDemo.Models;
using EduSyncAPIDemo.DTO;
using EduSyncAPIDemo.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace EduSyncAPIDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly EduSyncContext _context;
        private readonly JWTService _jwtService;

        public AuthController(EduSyncContext context, JWTService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO dto)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (existingUser != null)
                    return BadRequest(new { message = "User with this email already exists" });

                // Hash the password securely
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                var user = new User
                {
                    UserId = Guid.NewGuid(),
                    Name = dto.Name,
                    Email = dto.Email,
                    Role = dto.Role,
                    PasswordHash = hashedPassword
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = _jwtService.GenerateToken(user);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.UserId,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            try
            {
                // Find user by email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
                if (user == null)
                    return Unauthorized(new { message = "Invalid email or password" });

                // Verify password using BCrypt
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
                if (!isPasswordValid)
                    return Unauthorized(new { message = "Invalid email or password" });

                var token = _jwtService.GenerateToken(user);

                return Ok(new
                {
                    token,
                    user = new
                    {
                        id = user.UserId,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }
    }
}
