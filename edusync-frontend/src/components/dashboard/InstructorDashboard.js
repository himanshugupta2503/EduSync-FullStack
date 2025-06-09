import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import assessmentService from '../../services/assessmentService';
import resultService from '../../services/resultService';

const InstructorDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would have API endpoints to get 
        // courses taught by the instructor, assessments for those courses,
        // and student results. For now, we'll use the existing endpoints.
        
        // Get all courses (in a real app, this would be filtered by instructor)
        const coursesData = await courseService.getAllCourses();
        const instructorCourses = coursesData.filter(
          course => course.instructorId === currentUser?.userId
        );
        setCourses(instructorCourses);
        
        // Get all assessments (in a real app, this would be filtered by courses)
        const assessmentsData = await assessmentService.getAllAssessments();
        setAssessments(assessmentsData);
        
        // Get all results (in a real app, this would be filtered by instructor's courses)
        const resultsData = await resultService.getAllResults();
        setRecentResults(resultsData.slice(0, 5)); // Just taking first 5 for demo
        
        // Calculate student performance (mock data)
        const mockPerformance = [
          { metric: 'Average Score', value: '78%' },
          { metric: 'Completion Rate', value: '85%' },
          { metric: 'Student Engagement', value: '72%' },
          { metric: 'Assessments Created', value: assessmentsData.length }
        ];
        setStudentPerformance(mockPerformance);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.userId]);

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
          <h1 className="mb-0">Instructor Dashboard</h1>
          <p className="text-muted">Welcome back, {currentUser?.name}</p>
        </div>
        <div className="col-auto">
          <Link to="/instructor/courses/create" className="btn btn-primary me-2">
            <i className="bi bi-plus-circle me-2"></i>Create Course
          </Link>
          <Link to="/instructor/assessments/create" className="btn btn-outline-primary">
            <i className="bi bi-plus-circle me-2"></i>Create Assessment
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row mb-5">
        {studentPerformance.map((item, index) => (
          <div className="col-md-3 mb-3 mb-md-0" key={index}>
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-2">{item.metric}</h6>
                <h2 className="mb-0">{item.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Section */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Your Courses</h4>
                <Link to="/instructor/courses" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
            </div>
            <div className="card-body">
              {courses.length === 0 ? (
                <div className="alert alert-info">
                  You haven't created any courses yet. Click on "Create Course" to get started!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Students</th>
                        <th>Assessments</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => {
                        const courseAssessments = assessments.filter(a => a.courseId === course.courseId);
                        return (
                          <tr key={course.courseId}>
                            <td className="fw-bold">{course.title}</td>
                            <td className="text-truncate" style={{maxWidth: '250px'}}>{course.description}</td>
                            <td>
                              {/* Mock student count */}
                              <span className="badge bg-primary rounded-pill">25</span>
                            </td>
                            <td>
                              <span className="badge bg-info rounded-pill">{courseAssessments.length}</span>
                            </td>
                            <td>
                              <div className="btn-group">
                                <Link to={`/instructor/courses/${course.courseId}`} className="btn btn-sm btn-outline-primary">
                                  View
                                </Link>
                                <Link to={`/instructor/courses/edit/${course.courseId}`} className="btn btn-sm btn-outline-secondary">
                                  Edit
                                </Link>
                                <Link to={`/instructor/assessments/create?courseId=${course.courseId}`} className="btn btn-sm btn-outline-success">
                                  Add Assessment
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Recent Assessments</h4>
                <Link to="/instructor/assessments" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
            </div>
            <div className="card-body">
              {assessments.length === 0 ? (
                <div className="alert alert-info">
                  You haven't created any assessments yet. Click on "Create Assessment" to get started!
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Course</th>
                        <th>Max Score</th>
                        <th>Questions</th>
                        <th>Attempts</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assessments.slice(0, 5).map(assessment => {
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
                            console.log('Questions format:', typeof assessment.questions);
                            questionCount = typeof assessment.questions === 'string' ? 
                              (assessment.questions.split('\n').filter(line => line.trim().startsWith('Q')).length || 1) : 1;
                          }
                        }
                        
                        return (
                          <tr key={assessment.assessmentId}>
                            <td className="fw-bold">{assessment.title}</td>
                            <td>{course?.title || 'Unknown Course'}</td>
                            <td>{assessment.maxScore}</td>
                            <td>
                              <span className="badge bg-secondary rounded-pill">{questionCount}</span>
                            </td>
                            <td>
                              {/* Mock attempts count */}
                              <span className="badge bg-info rounded-pill">18</span>
                            </td>
                            <td>
                              <div className="btn-group">
                                <Link to={`/instructor/assessments/${assessment.assessmentId}`} className="btn btn-sm btn-outline-primary">
                                  View
                                </Link>
                                <Link to={`/instructor/assessments/edit/${assessment.assessmentId}`} className="btn btn-sm btn-outline-secondary">
                                  Edit
                                </Link>
                                <Link to={`/instructor/results?assessmentId=${assessment.assessmentId}`} className="btn btn-sm btn-outline-info">
                                  Results
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Student Results */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Recent Student Results</h4>
                <Link to="/instructor/results" className="btn btn-sm btn-outline-primary">View All</Link>
              </div>
            </div>
            <div className="card-body">
              {recentResults.length === 0 ? (
                <div className="alert alert-info">
                  No assessment results available yet. Students need to complete assessments to see results here.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Assessment</th>
                        <th>Score</th>
                        <th>Percentage</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResults.map(result => {
                        const assessment = assessments.find(a => a.assessmentId === result.assessmentId);
                        const percentage = assessment ? Math.round((result.score / assessment.maxScore) * 100) : 0;
                        
                        return (
                          <tr key={result.resultId}>
                            <td>
                              {/* Mock student name */}
                              Student {result.userId.substring(0, 6)}
                            </td>
                            <td>{assessment?.title || 'Unknown Assessment'}</td>
                            <td>
                              {result.score} / {assessment?.maxScore || 'Unknown'}
                            </td>
                            <td>
                              <div className="progress" style={{height: '20px'}}>
                                <div 
                                  className={`progress-bar ${percentage >= 70 ? 'bg-success' : percentage >= 40 ? 'bg-warning' : 'bg-danger'}`} 
                                  role="progressbar" 
                                  style={{width: `${percentage}%`}}
                                  aria-valuenow={percentage} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                >
                                  {percentage}%
                                </div>
                              </div>
                            </td>
                            <td>{new Date(result.attemptDate).toLocaleDateString()}</td>
                            <td>
                              <Link to={`/instructor/results/${result.resultId}`} className="btn btn-sm btn-outline-primary">
                                View Details
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
