import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import assessmentService from '../../services/assessmentService';
import resultService from '../../services/resultService';

const StudentDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would have API endpoints to get 
        // courses enrolled by the student, assessments for those courses,
        // and recent results. For now, we'll use the existing endpoints.
        
        // Get all courses (in a real app, this would be filtered by student enrollment)
        const courses = await courseService.getAllCourses();
        setEnrolledCourses(courses.slice(0, 4)); // Just taking first 4 for demo
        
        // Get all assessments (in a real app, this would be filtered by courses)
        const assessments = await assessmentService.getAllAssessments();
        setPendingAssessments(assessments.slice(0, 3)); // Just taking first 3 for demo
        
        // Get all results (in a real app, this would be filtered by student)
        const results = await resultService.getAllResults();
        setRecentResults(results.slice(0, 5)); // Just taking first 5 for demo
        
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
          <h1 className="mb-0">Welcome, {currentUser?.name}</h1>
          <p className="text-muted">Your learning dashboard</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row mb-5">
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                  <i className="bi bi-book text-primary fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Enrolled Courses</h5>
                  <h2 className="mt-2 mb-0">{enrolledCourses.length}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 me-3">
                  <i className="bi bi-clipboard-check text-warning fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Pending Assessments</h5>
                  <h2 className="mt-2 mb-0">{pendingAssessments.length}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                  <i className="bi bi-trophy text-success fs-4"></i>
                </div>
                <div>
                  <h5 className="card-title mb-0">Completed Assessments</h5>
                  <h2 className="mt-2 mb-0">{recentResults.length}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Your Courses</h2>
            <Link to="/courses" className="btn btn-outline-primary">View All</Link>
          </div>
          
          {enrolledCourses.length === 0 ? (
            <div className="alert alert-info">
              You are not enrolled in any courses yet. Explore our course catalog to get started!
            </div>
          ) : (
            <div className="row">
              {enrolledCourses.map(course => (
                <div className="col-md-6 col-lg-3 mb-4" key={course.courseId}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-img-top bg-light" style={{height: '140px'}}>
                      {course.mediaUrl ? (
                        <img src={course.mediaUrl} className="img-fluid h-100 w-100 object-fit-cover" alt={course.title} />
                      ) : (
                        <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                          <i className="bi bi-image fs-1"></i>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{course.title}</h5>
                      <p className="card-text text-truncate">{course.description}</p>
                    </div>
                    <div className="card-footer bg-white border-0">
                      <Link to={`/courses/${course.courseId}`} className="btn btn-primary w-100">Continue Learning</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Assessments */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Upcoming Assessments</h2>
            <Link to="/student/assessments" className="btn btn-outline-primary">View All</Link>
          </div>
          
          {pendingAssessments.length === 0 ? (
            <div className="alert alert-info">
              You don't have any upcoming assessments. Check back later!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Assessment</th>
                    <th>Course</th>
                    <th>Max Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAssessments.map(assessment => (
                    <tr key={assessment.assessmentId}>
                      <td>{assessment.title}</td>
                      <td>{enrolledCourses.find(c => c.courseId === assessment.courseId)?.title || 'Unknown Course'}</td>
                      <td>{assessment.maxScore} points</td>
                      <td>
                        <Link to={`/student/assessments/${assessment.assessmentId}`} className="btn btn-sm btn-primary">
                          Start
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Recent Results</h2>
            <Link to="/student/results" className="btn btn-outline-primary">View All</Link>
          </div>
          
          {recentResults.length === 0 ? (
            <div className="alert alert-info">
              You haven't completed any assessments yet. Start an assessment to see your results here!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Assessment</th>
                    <th>Score</th>
                    <th>Max Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentResults.map(result => {
                    const assessment = pendingAssessments.find(a => a.assessmentId === result.assessmentId);
                    const percentage = assessment ? Math.round((result.score / assessment.maxScore) * 100) : 0;
                    
                    return (
                      <tr key={result.resultId}>
                        <td>{assessment?.title || 'Unknown Assessment'}</td>
                        <td>{result.score}</td>
                        <td>{assessment?.maxScore || 'Unknown'}</td>
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
                          <Link to={`/student/results/${result.resultId}`} className="btn btn-sm btn-outline-primary">
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
  );
};

export default StudentDashboard;
