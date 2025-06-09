import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';

const AssessmentList = () => {
  const { currentUser, isInstructor } = useContext(AuthContext);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all assessments
        const assessmentsData = await assessmentService.getAllAssessments();
        setAssessments(assessmentsData);
        
        // Fetch all courses for filtering
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Failed to load assessments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter assessments by selected course
  const filteredAssessments = selectedCourse === 'all'
    ? assessments
    : assessments.filter(assessment => assessment.courseId === selectedCourse);

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1>{isInstructor ? 'Manage Assessments' : 'Available Assessments'}</h1>
          <p className="text-muted">
            {isInstructor 
              ? 'Create and manage your course assessments' 
              : 'View and take assessments for your enrolled courses'}
          </p>
        </div>
        {isInstructor && (
          <div className="col-auto">
            <Link to="/instructor/assessments/create" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Create Assessment
            </Link>
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="courseFilter" className="form-label">Filter by Course</label>
          <select 
            id="courseFilter" 
            className="form-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.courseId} value={course.courseId}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="alert alert-info">
          {selectedCourse === 'all'
            ? 'No assessments available.'
            : 'No assessments available for the selected course.'}
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Course</th>
                    <th>Questions</th>
                    <th>Max Score</th>
                    {isInstructor && <th>Responses</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssessments.map(assessment => {
                    const course = courses.find(c => c.courseId === assessment.courseId);
                    
                    // Safely handle questions count - try parsing JSON, but handle other formats too
                    let questionCount = 0;
                    if (assessment.questions) {
                      try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(assessment.questions);
                        questionCount = Array.isArray(parsed) ? parsed.length : 1;
                      } catch (e) {
                        // If parsing fails, it might be a string or other format
                        // Count by lines or just set to 1 if it exists
                        console.log('Questions format:', typeof assessment.questions);
                        questionCount = typeof assessment.questions === 'string' ? 
                          (assessment.questions.split('\n').filter(line => line.trim().startsWith('Q')).length || 1) : 1;
                      }
                    }
                    
                    return (
                      <tr key={assessment.assessmentId}>
                        <td className="fw-medium">{assessment.title}</td>
                        <td>{course?.title || 'Unknown Course'}</td>
                        <td>
                          <span className="badge bg-secondary rounded-pill">{questionCount}</span>
                        </td>
                        <td>{assessment.maxScore} points</td>
                        {isInstructor && (
                          <td>
                            {/* Mock data for student responses */}
                            <span className="badge bg-info rounded-pill">12</span>
                          </td>
                        )}
                        <td>
                          {isInstructor ? (
                            <div className="btn-group">
                              <Link 
                                to={`/instructor/assessments/${assessment.assessmentId}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View
                              </Link>
                              <Link 
                                to={`/instructor/assessments/edit/${assessment.assessmentId}`} 
                                className="btn btn-sm btn-outline-secondary"
                              >
                                Edit
                              </Link>
                              <Link 
                                to={`/instructor/results?assessmentId=${assessment.assessmentId}`} 
                                className="btn btn-sm btn-outline-info"
                              >
                                Results
                              </Link>
                            </div>
                          ) : (
                            <Link 
                              to={`/student/assessments/${assessment.assessmentId}`} 
                              className="btn btn-sm btn-primary"
                            >
                              Take Assessment
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
