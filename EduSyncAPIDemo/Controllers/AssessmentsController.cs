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
//    public class AssessmentsController : ControllerBase
//    {
//        private readonly EduSyncContext _context;

//        public AssessmentsController(EduSyncContext context)
//        {
//            _context = context;
//        }

//        // ✅ GET: api/Assessments
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<GetAssessmentDTO>>> GetAssessments()
//        {
//            var assessments = await _context.Assessments
//                .Select(a => new GetAssessmentDTO
//                {
//                    AssessmentId = a.AssessmentId,
//                    CourseId = a.CourseId!.Value,
//                    Title = a.Title!,
//                    Questions = a.Questions!,
//                    MaxScore = a.MaxScore!.Value
//                })
//                .ToListAsync();

//            return Ok(assessments);
//        }

//        // ✅ GET: api/Assessments/5
//        [HttpGet("{id}")]
//        public async Task<ActionResult<GetAssessmentDTO>> GetAssessment(Guid id)
//        {
//            var assessment = await _context.Assessments
//                .Where(a => a.AssessmentId == id)
//                .Select(a => new GetAssessmentDTO
//                {
//                    AssessmentId = a.AssessmentId,
//                    CourseId = a.CourseId!.Value,
//                    Title = a.Title!,
//                    Questions = a.Questions!,
//                    MaxScore = a.MaxScore!.Value
//                })
//                .FirstOrDefaultAsync();

//            if (assessment == null)
//                return NotFound();

//            return Ok(assessment);
//        }

//        // ✅ POST: api/Assessments
//        [HttpPost]
//        public async Task<ActionResult<Assessment>> PostAssessment(CreateAssessmentDTO dto)
//        {
//            var assessment = new Assessment
//            {
//                AssessmentId = Guid.NewGuid(),
//                CourseId = dto.CourseId,
//                Title = dto.Title,
//                Questions = dto.Questions,
//                MaxScore = dto.MaxScore
//            };

//            _context.Assessments.Add(assessment);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetAssessment), new { id = assessment.AssessmentId }, assessment);
//        }

//        // ✅ PUT: api/Assessments/5
//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutAssessment(Guid id, UpdateAssessmentDTO dto)
//        {
//            if (id != dto.AssessmentId)
//                return BadRequest();

//            var assessment = await _context.Assessments.FindAsync(id);
//            if (assessment == null)
//                return NotFound();

//            assessment.CourseId = dto.CourseId;
//            assessment.Title = dto.Title;
//            assessment.Questions = dto.Questions;
//            assessment.MaxScore = dto.MaxScore;

//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        // ✅ DELETE: api/Assessments/5
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteAssessment(Guid id)
//        {
//            var assessment = await _context.Assessments.FindAsync(id);
//            if (assessment == null)
//                return NotFound();

//            _context.Assessments.Remove(assessment);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        private bool AssessmentExists(Guid id)
//        {
//            return _context.Assessments.Any(e => e.AssessmentId == id);
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
    public class AssessmentsController : ControllerBase
    {
        private readonly EduSyncContext _context;

        public AssessmentsController(EduSyncContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Assessments
        [HttpGet]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<GetAssessmentDTO>>> GetAssessments()
        {
            var assessments = await _context.Assessments
                .Select(a => new GetAssessmentDTO
                {
                    AssessmentId = a.AssessmentId,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Questions = a.Questions,
                    MaxScore = a.MaxScore
                })
                .ToListAsync();

            return Ok(assessments);
        }

        // ✅ GET: api/Assessments/5
        [HttpGet("{id}")]
        //[Authorize]
        public async Task<ActionResult<GetAssessmentDTO>> GetAssessment(Guid id)
        {
            var assessment = await _context.Assessments
                .Where(a => a.AssessmentId == id)
                .Select(a => new GetAssessmentDTO
                {
                    AssessmentId = a.AssessmentId,
                    CourseId = a.CourseId,
                    Title = a.Title,
                    Questions = a.Questions,
                    MaxScore = a.MaxScore
                })
                .FirstOrDefaultAsync();

            if (assessment == null)
                return NotFound();

            return Ok(assessment);
        }

        // ✅ POST: api/Assessments
        [HttpPost]
        //[Authorize(Roles = "Instructor")]
        public async Task<ActionResult<Assessment>> PostAssessment(CreateAssessmentDTO dto)
        {
            var assessment = new Assessment
            {
                AssessmentId = Guid.NewGuid(),
                CourseId = dto.CourseId,
                Title = dto.Title,
                Questions = dto.Questions,
                MaxScore = dto.MaxScore
            };

            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAssessment), new { id = assessment.AssessmentId }, assessment);
        }

        // ✅ PUT: api/Assessments/5
        [HttpPut("{id}")]
        //[Authorize(Roles = "Instructor")]
        public async Task<IActionResult> PutAssessment(Guid id, UpdateAssessmentDTO dto)
        {
            if (id != dto.AssessmentId)
                return BadRequest();

            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
                return NotFound();

            assessment.CourseId = dto.CourseId;
            assessment.Title = dto.Title;
            assessment.Questions = dto.Questions;
            assessment.MaxScore = dto.MaxScore;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE: api/Assessments/5
        [HttpDelete("{id}")]
        //[Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteAssessment(Guid id)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
                return NotFound();

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AssessmentExists(Guid id)
        {
            return _context.Assessments.Any(e => e.AssessmentId == id);
        }
    }
}

