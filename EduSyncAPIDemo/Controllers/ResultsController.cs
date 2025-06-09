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
//    public class ResultsController : ControllerBase
//    {
//        private readonly EduSyncContext _context;

//        public ResultsController(EduSyncContext context)
//        {
//            _context = context;
//        }

//        // ✅ GET: api/Results
//        [HttpGet]
//        public async Task<ActionResult<IEnumerable<GetResultDTO>>> GetResults()
//        {
//            var results = await _context.Results
//                .Select(r => new GetResultDTO
//                {
//                    ResultId = r.ResultId,
//                    AssessmentId = r.AssessmentId!.Value,
//                    UserId = r.UserId!.Value,
//                    Score = r.Score!.Value,
//                    AttemptDate = r.AttemptDate!.Value
//                })
//                .ToListAsync();

//            return Ok(results);
//        }

//        // ✅ GET: api/Results/{id}
//        [HttpGet("{id}")]
//        public async Task<ActionResult<GetResultDTO>> GetResult(Guid id)
//        {
//            var result = await _context.Results
//                .Where(r => r.ResultId == id)
//                .Select(r => new GetResultDTO
//                {
//                    ResultId = r.ResultId,
//                    AssessmentId = r.AssessmentId!.Value,
//                    UserId = r.UserId!.Value,
//                    Score = r.Score!.Value,
//                    AttemptDate = r.AttemptDate!.Value
//                })
//                .FirstOrDefaultAsync();

//            if (result == null)
//                return NotFound();

//            return Ok(result);
//        }

//        // ✅ POST: api/Results
//        [HttpPost]
//        public async Task<ActionResult<Result>> PostResult(CreateResultDTO dto)
//        {
//            var result = new Result
//            {
//                ResultId = Guid.NewGuid(),
//                AssessmentId = dto.AssessmentId,
//                UserId = dto.UserId,
//                Score = dto.Score,
//                AttemptDate = dto.AttemptDate
//            };

//            _context.Results.Add(result);
//            await _context.SaveChangesAsync();

//            return CreatedAtAction(nameof(GetResult), new { id = result.ResultId }, result);
//        }

//        // ✅ PUT: api/Results/{id}
//        [HttpPut("{id}")]
//        public async Task<IActionResult> PutResult(Guid id, UpdateResultDTO dto)
//        {
//            if (id != dto.ResultId)
//                return BadRequest();

//            var result = await _context.Results.FindAsync(id);
//            if (result == null)
//                return NotFound();

//            result.AssessmentId = dto.AssessmentId;
//            result.UserId = dto.UserId;
//            result.Score = dto.Score;
//            result.AttemptDate = dto.AttemptDate;

//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        // ✅ DELETE: api/Results/{id}
//        [HttpDelete("{id}")]
//        public async Task<IActionResult> DeleteResult(Guid id)
//        {
//            var result = await _context.Results.FindAsync(id);
//            if (result == null)
//                return NotFound();

//            _context.Results.Remove(result);
//            await _context.SaveChangesAsync();

//            return NoContent();
//        }

//        private bool ResultExists(Guid id)
//        {
//            return _context.Results.Any(e => e.ResultId == id);
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
using System.Security.Claims;

namespace EduSyncAPIDemo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResultsController : ControllerBase
    {
        private readonly EduSyncContext _context;

        public ResultsController(EduSyncContext context)
        {
            _context = context;
        }

        // ✅ GET: api/Results
        [HttpGet]
        //[Authorize]
        public async Task<ActionResult<IEnumerable<GetResultDTO>>> GetResults()
        {
            var results = await _context.Results
                .Select(r => new GetResultDTO
                {
                    ResultId = r.ResultId,
                    AssessmentId = r.AssessmentId,
                    UserId = r.UserId,
                    Score = r.Score,
                    AttemptDate = r.AttemptDate
                })
                .ToListAsync();

            return Ok(results);
        }

        // ✅ GET: api/Results/{id}
        [HttpGet("{id}")]
        //[Authorize]
        public async Task<ActionResult<GetResultDTO>> GetResult(Guid id)
        {
            var result = await _context.Results
                .Where(r => r.ResultId == id)
                .Select(r => new GetResultDTO
                {
                    ResultId = r.ResultId,
                    AssessmentId = r.AssessmentId,
                    UserId = r.UserId,
                    Score = r.Score,
                    AttemptDate = r.AttemptDate
                })
                .FirstOrDefaultAsync();

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        // ✅ POST: api/Results
        [HttpPost]
        //[Authorize(Roles = "Student")]
        public async Task<ActionResult<Result>> PostResult(CreateResultDTO dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var result = new Result
            {
                ResultId = Guid.NewGuid(),
                AssessmentId = dto.AssessmentId,
                UserId = userId,
                Score = dto.Score,
                AttemptDate = dto.AttemptDate
            };

            _context.Results.Add(result);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResult), new { id = result.ResultId }, result);
        }

        // ✅ PUT: api/Results/{id}
        [HttpPut("{id}")]
        //[Authorize(Roles = "Instructor")]
        public async Task<IActionResult> PutResult(Guid id, UpdateResultDTO dto)
        {
            if (id != dto.ResultId)
                return BadRequest();

            var result = await _context.Results.FindAsync(id);
            if (result == null)
                return NotFound();

            result.AssessmentId = dto.AssessmentId;
            result.UserId = dto.UserId;
            result.Score = dto.Score;
            result.AttemptDate = dto.AttemptDate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // ✅ DELETE: api/Results/{id}
        [HttpDelete("{id}")]
        //[Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteResult(Guid id)
        {
            var result = await _context.Results.FindAsync(id);
            if (result == null)
                return NotFound();

            _context.Results.Remove(result);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ResultExists(Guid id)
        {
            return _context.Results.Any(e => e.ResultId == id);
        }
    }
}
