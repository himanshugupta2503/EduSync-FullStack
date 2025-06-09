//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.EntityFrameworkCore;
//using EduSyncAPIDemo.Data;
//using EduSyncAPIDemo.Models;
//using EduSyncAPIDemo.DTO;

//namespace EduSyncAPIDemo.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class UsersController : ControllerBase
//    {
//        private readonly EduSyncContext _context;

//        public UsersController(EduSyncContext context)
//        {
//            _context = context;
//        }

//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<GetUserDTO>>> GetUsers()
//        {
//            var users = await _context.Users
//                .Select(u => new GetUserDTO
//                {
//                    UserId = u.UserId,
//                    Name = u.Name!,
//                    Email = u.Email!,
//                    Role = u.Role!
//                })
//                .ToListAsync();

//            return Ok(users);
//        }

//        [HttpGet("{id}")]
//        public async Task<ActionResult<GetUserDTO>> GetUser(Guid id)
//        {
//            var user = await _context.Users
//                .Where(u => u.UserId == id)
//                .Select(u => new GetUserDTO
//                {
//                    UserId = u.UserId,
//                    Name = u.Name!,
//                    Email = u.Email!,
//                    Role = u.Role!
//                })
//                .FirstOrDefaultAsync();

//            if (user == null)
//                return NotFound();

//            return Ok(user);
//        }

//        [HttpPost]
//        public async Task<ActionResult<User>> PostUser(CreateUserDTO dto)
//        {
//            var user = new User
//            {
//                UserId = Guid.NewGuid(),
//                Name = dto.Name,
//                Email = dto.Email,
//                Role = dto.Role,
//                PasswordHash = dto.PasswordHash
//            };

//            _context.Users.Add(user);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutUser(Guid id, UpdateUserDTO dto)
//        {
//            if (id != dto.UserId)
//                return BadRequest();

//            var user = await _context.Users.FindAsync(id);
//            if (user == null)
//                return NotFound();

//            user.Name = dto.Name;
//            user.Email = dto.Email;
//            user.Role = dto.Role;
//            user.PasswordHash = dto.PasswordHash;

//            await _context.SaveChangesAsync();

//            return NoContent();
//        }


//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteUser(Guid id)
//        {
//            var user = await _context.Users.FindAsync(id);
//            if (user == null)
//                return NotFound();

//            _context.Users.Remove(user);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//    }
//}



using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduSyncAPIDemo.Data;
using EduSyncAPIDemo.Models;
using EduSyncAPIDemo.DTO;
using Microsoft.AspNetCore.Authorization;

namespace EduSyncAPIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly EduSyncContext _context;

        public UsersController(EduSyncContext context)
        {
            _context = context;
        }

        // Only Instructors can create users (e.g., new instructor or admin panel)
        [HttpPost("register")]
        //[Authorize(Roles = "Instructor")]
        public async Task<ActionResult<User>> PostUser(CreateUserDTO dto)
        {
            var user = new User
            {
                UserId = Guid.NewGuid(),
                Name = dto.Name,
                Email = dto.Email,
                Role = dto.Role,
                PasswordHash = dto.PasswordHash
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        // Only authorized users can see user list
        [HttpGet]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<GetUserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new GetUserDTO
                {
                    UserId = u.UserId,
                    Name = u.Name!,
                    Email = u.Email!,
                    Role = u.Role!
                })
                .ToListAsync();

            return Ok(users);
        }

        // Only authorized users can fetch user by ID
        [HttpGet("{id}")]
        //[Authorize]
        public async Task<ActionResult<GetUserDTO>> GetUser(Guid id)
        {
            var user = await _context.Users
                .Where(u => u.UserId == id)
                .Select(u => new GetUserDTO
                {
                    UserId = u.UserId,
                    Name = u.Name!,
                    Email = u.Email!,
                    Role = u.Role!
                })
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // Only authorized users can update users
        [HttpPut("{id}")]
        //[Authorize]
        public async Task<IActionResult> PutUser(Guid id, UpdateUserDTO dto)
        {
            if (id != dto.UserId)
                return BadRequest();

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.Role = dto.Role;
            user.PasswordHash = dto.PasswordHash;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Only authorized users can delete
        [HttpDelete("{id}")]
        //[Authorize]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
