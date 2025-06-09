import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';

const ResultList = () => {
  const { currentUser, isInstructor } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const assessmentIdFilter = queryParams.get('assessmentId');
  
  const [results, setResults] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(assessmentIdFilter || 'all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch results
        const resultsData = await resultService.getAllResults();
        
        // If instructor, get all results
        // If student, filter by their user ID
        const filteredResults = isInstructor 
          ? resultsData
          : resultsData.filter(result => result.userId === currentUser?.userId);
        
        setResults(filteredResults);
        
        // Fetch assessments for dropdown filter
        const assessmentsData = await assessmentService.getAllAssessments();
        setAssessments(assessmentsData);
        
        // Fetch courses for context
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.userId, isInstructor]);

  // Filter results by selected assessment
  const filteredResults = selectedAssessment === 'all'
    ? results
    : results.filter(result => result.assessmentId === selectedAssessment);

  // Calculate performance metrics for instructor dashboard
  const calculateMetrics = () => {
    if (filteredResults.length === 0) return null;
    
    const totalScore = filteredResults.reduce((sum, result) => sum + result.score, 0);
    const avgScore = totalScore / filteredResults.length;
    
    // Count passing results (score > 60%)
    const passingResults = filteredResults.filter(result => {
      const assessment = assessments.find(a => a.assessmentId === result.assessmentId);
      return assessment && (result.score / assessment.maxScore) >= 0.6;
    }).length;
    
    const passRate = (passingResults / filteredResults.length) * 100;
    
    return {
      avgScore: avgScore.toFixed(1),
      passRate: passRate.toFixed(1)
    };
  };

  const metrics = calculateMetrics();

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
          <h1>{isInstructor ? 'Student Results' : 'My Results'}</h1>
          <p className="text-muted">
            {isInstructor 
              ? 'View and analyze student assessment results' 
              : 'Track your performance across all assessments'}
          </p>
        </div>
      </div>

      {/* Instructor Analytics */}
      {isInstructor && metrics && (
        <div className="row mb-4">
          <div className="col-md-3 mb-3 mb-md-0">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-2">Total Results</h6>
                <h2 className="mb-0">{filteredResults.length}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-2">Average Score</h6>
                <h2 className="mb-0">{metrics.avgScore}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3 mb-md-0">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-2">Pass Rate</h6>
                <h2 className="mb-0">{metrics.passRate}%</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-2">Unique Students</h6>
                <h2 className="mb-0">
                  {new Set(filteredResults.map(r => r.userId)).size}
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="assessmentFilter" className="form-label">Filter by Assessment</label>
          <select 
            id="assessmentFilter" 
            className="form-select"
            value={selectedAssessment}
            onChange={(e) => setSelectedAssessment(e.target.value)}
          >
            <option value="all">All Assessments</option>
            {assessments.map(assessment => (
              <option key={assessment.assessmentId} value={assessment.assessmentId}>
                {assessment.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results List */}
      {filteredResults.length === 0 ? (
        <div className="alert alert-info">
          {selectedAssessment === 'all'
            ? 'No results available yet.'
            : 'No results available for the selected assessment.'}
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    {isInstructor && <th>Student</th>}
                    <th>Assessment</th>
                    <th>Course</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map(result => {
                    const assessment = assessments.find(a => a.assessmentId === result.assessmentId);
                    const course = assessment && courses.find(c => c.courseId === assessment.courseId);
                    const percentage = assessment 
                      ? Math.round((result.score / assessment.maxScore) * 100) 
                      : 0;
                    
                    return (
                      <tr key={result.resultId}>
                        {isInstructor && (
                          <td>
                            {/* In a real app, show actual student name from user data */}
                            Student {result.userId.substring(0, 8)}
                          </td>
                        )}
                        <td>{assessment?.title || 'Unknown Assessment'}</td>
                        <td>{course?.title || 'Unknown Course'}</td>
                        <td>
                          {result.score} / {assessment?.maxScore || 'Unknown'}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{height: '10px'}}>
                              <div 
                                className={`progress-bar ${
                                  percentage >= 70 ? 'bg-success' : 
                                  percentage >= 40 ? 'bg-warning' : 
                                  'bg-danger'
                                }`} 
                                role="progressbar" 
                                style={{width: `${percentage}%`}}
                                aria-valuenow={percentage} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              ></div>
                            </div>
                            <span>{percentage}%</span>
                          </div>
                        </td>
                        <td>{new Date(result.attemptDate).toLocaleDateString()}</td>
                        <td>
                          <Link 
                            to={`/${isInstructor ? 'instructor' : 'student'}/results/${result.resultId}`} 
                            className="btn btn-sm btn-primary"
                          >
                            View Details
                          </Link>
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

export default ResultList;
