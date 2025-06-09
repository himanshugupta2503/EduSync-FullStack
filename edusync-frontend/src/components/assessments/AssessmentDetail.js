import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import assessmentService from '../../services/assessmentService';
import resultService from '../../services/resultService';
import courseService from '../../services/courseService';

const AssessmentDetail = () => {
  const { assessmentId } = useParams();
  const { currentUser, isInstructor, isStudent } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState(null);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        
        // Fetch assessment details
        const assessmentData = await assessmentService.getAssessmentById(assessmentId);
        setAssessment(assessmentData);
        
        // Parse questions JSON
        if (assessmentData.questions) {
          try {
            const parsedQuestions = JSON.parse(assessmentData.questions);
            setQuestions(parsedQuestions);
            
            // Initialize answers object
            const initialAnswers = {};
            parsedQuestions.forEach((question, index) => {
              initialAnswers[index] = '';
            });
            setAnswers(initialAnswers);
          } catch (err) {
            console.error('Error parsing questions JSON:', err);
            setError('Invalid assessment questions format.');
          }
        }
        
        // Fetch course information
        if (assessmentData.courseId) {
          const courseData = await courseService.getCourseById(assessmentData.courseId);
          setCourse(courseData);
        }
        
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      fetchAssessmentData();
    }
  }, [assessmentId]);

  // Set up timer when assessment is started
  useEffect(() => {
    let timer;
    if (assessmentStarted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-submit when timer runs out
            handleSubmitAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearTimeout(timer);
  }, [assessmentStarted, timeLeft]);

  const startAssessment = () => {
    setAssessmentStarted(true);
    // Set timer for 30 minutes (1800 seconds)
    setTimeLeft(1800);
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleNextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const calculateScore = () => {
    let score = 0;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += question.points || 1;
      }
    });
    
    return score;
  };

  const handleSubmitAssessment = async () => {
    if (!assessmentStarted || submitting) return;
    
    // Calculate score
    const score = calculateScore();
    
    setSubmitting(true);
    
    try {
      // Format answers if needed - convert from object format to array format
      // This ensures the answers are in the format expected by the backend
      
      // Create result object
      const resultData = {
        assessmentId,
        userId: currentUser.userId,
        score,
        // Don't need to include answers as our backend doesn't store them
      };
      
      console.log('Submitting assessment result:', resultData);
      
      // Submit result to API
      await resultService.createResult(resultData);
      
      toast.success('Assessment submitted successfully!');
      navigate('/student/results');
    } catch (error) {
      console.error('Assessment submission error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      toast.error('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!assessment) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Assessment not found. <Link to="/assessments">Return to assessment list</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Assessment Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to={isInstructor ? "/instructor/assessments" : "/student/assessments"}>
                  Assessments
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">{assessment.title}</li>
            </ol>
          </nav>
          <h1 className="mb-2">{assessment.title}</h1>
          {course && (
            <p className="text-muted mb-0">Course: {course.title}</p>
          )}
        </div>
        
        {/* Instructor actions */}
        {isInstructor && (
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to={`/instructor/assessments/edit/${assessmentId}`} className="btn btn-primary me-2">
              <i className="bi bi-pencil me-2"></i>Edit
            </Link>
            <Link to={`/instructor/results?assessmentId=${assessmentId}`} className="btn btn-info">
              <i className="bi bi-bar-chart me-2"></i>View Results
            </Link>
          </div>
        )}
      </div>

      {/* Assessment Content */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {isStudent && !assessmentStarted 
                  ? 'Assessment Overview' 
                  : 'Assessment Questions'
                }
              </h4>
              
              {/* Timer display for students during assessment */}
              {isStudent && assessmentStarted && timeLeft !== null && (
                <div className={`badge ${timeLeft < 300 ? 'bg-danger' : 'bg-primary'} p-2`}>
                  <i className="bi bi-clock me-1"></i>
                  Time Left: {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            <div className="card-body">
              {/* Instructions for students before starting */}
              {isStudent && !assessmentStarted && (
                <>
                  <div className="alert alert-info">
                    <h5><i className="bi bi-info-circle me-2"></i>Assessment Instructions</h5>
                    <ul className="mb-0">
                      <li>This assessment contains {questions.length} questions</li>
                      <li>Maximum score: {assessment.maxScore} points</li>
                      <li>Time limit: 30 minutes</li>
                      <li>You cannot pause the assessment once started</li>
                    </ul>
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <button 
                      className="btn btn-primary btn-lg" 
                      onClick={startAssessment}
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Assessment
                    </button>
                  </div>
                </>
              )}
              
              {/* Assessment questions for students */}
              {isStudent && assessmentStarted && (
                <>
                  <div className="mb-4">
                    <div className="progress" style={{height: '8px'}}>
                      <div 
                        className="progress-bar bg-success" 
                        role="progressbar" 
                        style={{width: `${((currentStep + 1) / questions.length) * 100}%`}}
                        aria-valuenow={(currentStep + 1)} 
                        aria-valuemin="0" 
                        aria-valuemax={questions.length}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <small className="text-muted">Question {currentStep + 1} of {questions.length}</small>
                      <small className="text-muted">
                        {Math.round(((currentStep + 1) / questions.length) * 100)}% Complete
                      </small>
                    </div>
                  </div>
                  
                  {questions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-3">Question {currentStep + 1}</h4>
                      <p className="mb-4">{questions[currentStep].questionText}</p>
                      
                      <div className="list-group">
                        {questions[currentStep].options.map((option, optionIndex) => (
                          <label 
                            key={optionIndex} 
                            className={`list-group-item list-group-item-action d-flex gap-3 align-items-center ${
                              answers[currentStep] === optionIndex.toString() ? 'active' : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentStep}`}
                              value={optionIndex}
                              checked={answers[currentStep] === optionIndex.toString()}
                              onChange={() => handleAnswerChange(currentStep, optionIndex.toString())}
                              className="form-check-input flex-shrink-0"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between mt-4">
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Previous
                    </button>
                    
                    {currentStep < questions.length - 1 ? (
                      <button 
                        className="btn btn-primary" 
                        onClick={handleNextStep}
                      >
                        Next
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button 
                        className="btn btn-success" 
                        onClick={handleSubmitAssessment}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Assessment
                            <i className="bi bi-check-circle ms-2"></i>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
              
              {/* Display for instructors */}
              {isInstructor && (
                <>
                  <h5 className="mb-3">Assessment Questions</h5>
                  <div className="list-group">
                    {questions.map((question, index) => (
                      <div className="list-group-item" key={index}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Question {index + 1}</h6>
                          <span className="badge bg-primary">{question.points || 1} points</span>
                        </div>
                        <p>{question.questionText}</p>
                        <div className="ms-3 mb-2">
                          <p className="text-muted mb-1">Options:</p>
                          <ol className="ps-3">
                            {question.options.map((option, optIndex) => (
                              <li 
                                key={optIndex}
                                className={optIndex.toString() === question.correctAnswer ? 'text-success fw-bold' : ''}
                              >
                                {option}
                                {optIndex.toString() === question.correctAnswer && ' (Correct)'}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Assessment Details</h4>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Max Score</span>
                  <span className="fw-bold">{assessment.maxScore} points</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Questions</span>
                  <span className="badge bg-primary rounded-pill">{questions.length}</span>
                </li>
                {isInstructor && (
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Student Attempts</span>
                    {/* Mock data - in a real app, get actual count from API */}
                    <span className="badge bg-info rounded-pill">12</span>
                  </li>
                )}
                {isInstructor && (
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    <span>Average Score</span>
                    {/* Mock data - in a real app, calculate from results */}
                    <span className="fw-bold">78%</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {isStudent && assessmentStarted && (
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h4 className="mb-0">Question Navigator</h4>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={`btn ${
                        currentStep === index
                          ? 'btn-primary'
                          : answers[index]
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <div className="alert alert-info mt-3 mb-0">
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      <i className="bi bi-info-circle-fill fs-5"></i>
                    </div>
                    <div>
                      <strong>Answered: </strong>
                      {Object.values(answers).filter(a => a !== '').length} of {questions.length} questions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentDetail;
