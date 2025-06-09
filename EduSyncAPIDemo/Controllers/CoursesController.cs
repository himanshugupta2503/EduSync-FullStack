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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.WebUtilities;
using System.IO;
using backend.Services;

namespace EduSyncAPIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursesController : ControllerBase
    {
        private readonly EduSyncContext _context;
        private readonly BlobStorageService _blobStorageService;
        private readonly IConfiguration _configuration;

        public CoursesController(EduSyncContext context, BlobStorageService blobStorageService, IConfiguration configuration)
        {
            _context = context;
            _blobStorageService = blobStorageService;
            _configuration = configuration;
        }

        // ✅ GET: api/Courses
        [HttpGet]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<GetCourseDTO>>> GetCourses()
        {
            var courses = await _context.Courses
                .Select(c => new GetCourseDTO
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    InstructorId = c.InstructorId,
                    MediaUrl = c.MediaUrl
                })
                .ToListAsync();

            return Ok(courses);
        }

        // ✅ GET: api/Courses/5
        [HttpGet("{id}")]
        //[Authorize]
        public async Task<ActionResult<GetCourseDTO>> GetCourse(Guid id)
        {
            var course = await _context.Courses
                .Where(c => c.CourseId == id)
                .Select(c => new GetCourseDTO
                {
                    CourseId = c.CourseId,
                    Title = c.Title,
                    Description = c.Description,
                    InstructorId = c.InstructorId,
                    MediaUrl = c.MediaUrl
                })
                .FirstOrDefaultAsync();

            if (course == null)
                return NotFound();

            return Ok(course);
        }

        // ✅ POST: api/Courses
        [HttpPost]
        //[Authorize(Roles = "Instructor")]
        public async Task<ActionResult<Course>> PostCourse(CreateCourseDTO dto)
        {
            try
            {
                Console.WriteLine($"Received course creation request: Title={dto.Title}, MediaUrl={dto.MediaUrl}");

                var course = new Course
                {
                    CourseId = Guid.NewGuid(),
                    Title = dto.Title,
                    Description = dto.Description,
                    InstructorId = dto.InstructorId,
                    MediaUrl = dto.MediaUrl
                };

                _context.Courses.Add(course);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Course created successfully: CourseId={course.CourseId}");
                return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating course: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = $"Error creating course: {ex.Message}" });
            }
        }
        
        // Upload course media file to blob storage
        [HttpPost("upload-media")]
        [RequestFormLimits(MultipartBodyLengthLimit = 104857600)] // 100 MB
        [RequestSizeLimit(104857600)] // 100 MB
        //[Authorize(Roles = "Instructor")]
        public async Task<ActionResult<string>> UploadCourseMedia(IFormFile file)
        {
            Console.WriteLine($"Received file upload request. File: {(file != null ? $"{file.FileName}, {file.Length} bytes, {file.ContentType}" : "null")}");
            
            if (file == null || file.Length == 0)
            {
                Console.WriteLine("No file was uploaded or file is empty");
                return BadRequest("No file was uploaded or file is empty");
            }

            try
            {
                Console.WriteLine($"Processing file upload: {file.FileName}");
                using var stream = file.OpenReadStream();
                string contentType = file.ContentType;
                string fileName = file.FileName;
                
                // Upload the file to blob storage
                string blobUrl = await _blobStorageService.UploadFileAsync(stream, fileName, contentType);
                
                Console.WriteLine($"File uploaded successfully to blob storage: {blobUrl}");
                return Ok(new { mediaUrl = blobUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading file: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
        
        // Test YouTube URL handling
        [HttpPost("test-youtube")]
        public ActionResult TestYoutubeUrl([FromBody] TestUrlDTO urlData)
        {
            try
            {
                Console.WriteLine($"Testing YouTube URL handling: {urlData?.Url ?? "null"}");
                
                if (string.IsNullOrEmpty(urlData?.Url))
                {
                    return BadRequest("No URL provided");
                }
                
                // Simulate the course creation process
                var testCourse = new Course
                {
                    CourseId = Guid.NewGuid(),
                    Title = "Test YouTube Course",
                    Description = "Test Description",
                    InstructorId = Guid.NewGuid(),
                    MediaUrl = urlData.Url
                };
                
                // Don't actually save to database, just return success
                return Ok(new { 
                    success = true, 
                    message = "YouTube URL accepted", 
                    courseData = testCourse 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"YouTube URL test error: {ex.Message}");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        
        // Test Azure Blob Storage Connection
        [HttpGet("test-blob")]
        public async Task<ActionResult> TestBlobStorage()
        {
            try
            {
                Console.WriteLine("Testing Azure Blob Storage connection...");
                var testContent = "This is a test file from EduSync " + DateTime.Now.ToString();
                var testBytes = System.Text.Encoding.UTF8.GetBytes(testContent);
                
                using var memoryStream = new MemoryStream(testBytes);
                string testFileName = "test_" + Guid.NewGuid() + ".txt";
                
                // Upload test file
                string blobUrl = await _blobStorageService.UploadFileAsync(memoryStream, testFileName, "text/plain");
                
                Console.WriteLine($"Test file uploaded successfully to: {blobUrl}");
                return Ok(new { success = true, message = "Blob storage connection working!", url = blobUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BLOB TEST ERROR: {ex.Message}");
                Console.WriteLine($"BLOB TEST STACK TRACE: {ex.StackTrace}");
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }
        
        // Simplified test upload endpoint - direct implementation
        [HttpPost("simple-upload")]
        [RequestSizeLimit(104857600)] // 100 MB
        public async Task<ActionResult> SimpleUpload(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file provided");
            }
            
            try
            {
                // Get Azure Storage settings directly
                var connectionString = _configuration["MyBlobStorage:ConnectionString"];
                var containerName = _configuration["MyBlobStorage:ContainerName"];
                
                Console.WriteLine($"Using connection string: {connectionString?.Substring(0, 20)}...");
                Console.WriteLine($"Using container: {containerName}");
                
                // Create a direct blob client
                var blobServiceClient = new Azure.Storage.Blobs.BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                
                // Create container if it doesn't exist
                await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);
                
                // Generate unique blob name
                string blobName = $"{Guid.NewGuid()}_{file.FileName}";
                var blobClient = containerClient.GetBlobClient(blobName);
                
                Console.WriteLine($"Uploading {file.FileName} directly to blob storage...");
                
                // Upload directly from the file stream
                using (var stream = file.OpenReadStream())
                {
                    await blobClient.UploadAsync(stream, overwrite: true);
                }
                
                var blobUrl = blobClient.Uri.ToString();
                Console.WriteLine($"Simple upload success: {blobUrl}");
                
                return Ok(new { mediaUrl = blobUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Simple upload error: {ex.Message}");
                return StatusCode(500, ex.ToString());
            }
        }

        // ✅ PUT: api/Courses/5
        [HttpPut("{id}")]
        //[Authorize(Roles = "Instructor")]
        public async Task<IActionResult> PutCourse(Guid id, UpdateCourseDTO dto)
        {
            if (id != dto.CourseId)
                return BadRequest();

            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            course.Title = dto.Title;
            course.Description = dto.Description;
            course.InstructorId = dto.InstructorId;
            course.MediaUrl = dto.MediaUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Courses/5
        // ✅ DELETE: api/Courses/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            try
            {
                Console.WriteLine($"DELETE request received for course ID: {id}");
                
                // Find the course
                var course = await _context.Courses.FindAsync(id);
                if (course == null)
                {
                    Console.WriteLine($"Course with ID {id} not found");
                    return NotFound(new { message = "Course not found" });
                }
                
                // Get current user ID from claims
                var currentUserId = User.FindFirst("UserId")?.Value;
                var instructorIdGuid = course.InstructorId;
                
                Console.WriteLine($"Course instructor ID: {instructorIdGuid}, Current user ID: {currentUserId}");
                
                // Verify that the current user is the instructor who owns this course
                if (currentUserId != null && instructorIdGuid.ToString() != currentUserId)
                {
                    Console.WriteLine("Permission denied: User is not the course instructor");
                    return Forbid();
                }
                
                // Delete the course
                _context.Courses.Remove(course);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"Course {id} successfully deleted");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting course {id}: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while deleting the course", error = ex.Message });
            }
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
}
