import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';

const ResultDetail = () => {
  const { resultId } = useParams();
  const { isInstructor } = useContext(AuthContext);
  
  const [result, setResult] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResultData = async () => {
      try {
        setLoading(true);
        
        // Fetch result details
        const resultData = await resultService.getResultById(resultId);
        setResult(resultData);
        
        // Parse user answers if available
        if (resultData.answers) {
          try {
            const parsedAnswers = JSON.parse(resultData.answers);
            setUserAnswers(parsedAnswers);
          } catch (err) {
            console.error('Error parsing answers JSON:', err);
          }
        }
        
        // Fetch assessment details
        if (resultData.assessmentId) {
          const assessmentData = await assessmentService.getAssessmentById(resultData.assessmentId);
          setAssessment(assessmentData);
          
          // Parse questions
          if (assessmentData.questions) {
            try {
              const parsedQuestions = JSON.parse(assessmentData.questions);
              setQuestions(parsedQuestions);
            } catch (err) {
              console.error('Error parsing questions JSON:', err);
            }
          }
          
          // Fetch course information
          if (assessmentData.courseId) {
            const courseData = await courseService.getCourseById(assessmentData.courseId);
            setCourse(courseData);
          }
        }
        
      } catch (err) {
        console.error('Error fetching result data:', err);
        setError('Failed to load result details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (resultId) {
      fetchResultData();
    }
  }, [resultId]);

  const calculatePercentage = () => {
    if (!result || !assessment) return 0;
    return Math.round((result.score / assessment.maxScore) * 100);
  };

  const percentage = calculatePercentage();

  const getPerformanceLabel = () => {
    if (percentage >= 90) return { label: 'Excellent', class: 'text-success' };
    if (percentage >= 80) return { label: 'Very Good', class: 'text-success' };
    if (percentage >= 70) return { label: 'Good', class: 'text-primary' };
    if (percentage >= 60) return { label: 'Satisfactory', class: 'text-primary' };
    if (percentage >= 50) return { label: 'Pass', class: 'text-warning' };
    return { label: 'Needs Improvement', class: 'text-danger' };
  };

  const performance = getPerformanceLabel();

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

  if (!result || !assessment) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Result not found. <Link to={`/${isInstructor ? 'instructor' : 'student'}/results`}>Return to results list</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Result Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to={`/${isInstructor ? 'instructor' : 'student'}/results`}>
                  Results
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Result Details</li>
            </ol>
          </nav>
          <h1 className="mb-2">{assessment.title}</h1>
          {course && (
            <p className="text-muted mb-0">Course: {course.title}</p>
          )}
        </div>
        
        <div className="col-md-4 text-md-end mt-3 mt-md-0">
          <Link 
            to={`/${isInstructor ? 'instructor' : 'student'}/assessments/${assessment.assessmentId}`} 
            className="btn btn-outline-primary"
          >
            <i className="bi bi-clipboard me-2"></i>View Assessment
          </Link>
        </div>
      </div>

      {/* Result Summary */}
      <div className="row mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Result Summary</h4>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6 mb-3 mb-md-0">
                  <div className="text-center">
                    <div className="display-1 fw-bold mb-3">{result.score}</div>
                    <p className="mb-0">out of {assessment.maxScore} points</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="text-center mb-3">
                    <h2 className={performance.class}>{performance.label}</h2>
                    <p className="mb-0">Performance Rating</p>
                  </div>
                  
                  <div className="progress mb-2" style={{height: '20px'}}>
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
                    >
                      {percentage}%
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <small>0%</small>
                    <small>50%</small>
                    <small>100%</small>
                  </div>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Completion Date</span>
                  <span className="fw-bold">{new Date(result.attemptDate).toLocaleString()}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Questions</span>
                  <span className="fw-bold">{questions.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Correct Answers</span>
                  <span className="fw-bold">
                    {Object.keys(userAnswers).filter(questionIndex => 
                      userAnswers[questionIndex] === questions[questionIndex]?.correctAnswer
                    ).length}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Question Results */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">Question Details</h4>
            </div>
            <div className="card-body">
              {questions.length === 0 ? (
                <div className="alert alert-info">
                  No question details available for this assessment.
                </div>
              ) : (
                <div className="accordion" id="questionsAccordion">
                  {questions.map((question, questionIndex) => {
                    const userAnswer = userAnswers[questionIndex];
                    const isCorrect = userAnswer === question.correctAnswer;
                    
                    return (
                      <div className="accordion-item mb-3 border" key={questionIndex}>
                        <h2 className="accordion-header" id={`heading${questionIndex}`}>
                          <button
                            className={`accordion-button ${isCorrect ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${questionIndex}`}
                            aria-expanded={questionIndex === 0}
                            aria-controls={`collapse${questionIndex}`}
                          >
                            <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                              <span>
                                Question {questionIndex + 1}: {question.questionText.substring(0, 50)}
                                {question.questionText.length > 50 ? '...' : ''}
                              </span>
                              <span className={`badge ${isCorrect ? 'bg-success' : 'bg-danger'}`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            </div>
                          </button>
                        </h2>
                        <div
                          id={`collapse${questionIndex}`}
                          className={`accordion-collapse collapse ${questionIndex === 0 ? 'show' : ''}`}
                          aria-labelledby={`heading${questionIndex}`}
                          data-bs-parent="#questionsAccordion"
                        >
                          <div className="accordion-body">
                            <p className="mb-3">{question.questionText}</p>
                            
                            <div className="mb-3">
                              <p className="fw-bold mb-2">Options:</p>
                              <div className="ms-3">
                                {question.options.map((option, optionIndex) => (
                                  <div 
                                    key={optionIndex} 
                                    className={`mb-2 p-2 rounded ${
                                      optionIndex.toString() === question.correctAnswer 
                                        ? 'bg-success bg-opacity-10' 
                                        : optionIndex.toString() === userAnswer && userAnswer !== question.correctAnswer
                                          ? 'bg-danger bg-opacity-10'
                                          : ''
                                    }`}
                                  >
                                    <div className="d-flex align-items-center">
                                      <div className="me-2">
                                        {optionIndex.toString() === userAnswer && (
                                          <i className={`bi ${
                                            isCorrect 
                                              ? 'bi-check-circle-fill text-success' 
                                              : 'bi-x-circle-fill text-danger'
                                          }`}></i>
                                        )}
                                        {optionIndex.toString() === question.correctAnswer && 
                                         optionIndex.toString() !== userAnswer && (
                                          <i className="bi bi-check-circle text-success"></i>
                                        )}
                                      </div>
                                      <div>
                                        {option}
                                        {optionIndex.toString() === question.correctAnswer && (
                                          <span className="ms-2 text-success">(Correct Answer)</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <span className="fw-bold">Points: </span>
                              <span>
                                {isCorrect ? question.points : 0} / {question.points}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          {/* Performance Analytics */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Performance Analytics</h4>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h5>Strengths</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Strong understanding of core concepts
                  </li>
                  <li className="list-group-item d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Good application of knowledge
                  </li>
                </ul>
              </div>
              
              <div>
                <h5>Areas for Improvement</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    Review advanced topics
                  </li>
                  <li className="list-group-item d-flex align-items-center">
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    Practice more complex problems
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Student/Instructor Info */}
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">{isInstructor ? 'Student Information' : 'Instructor Feedback'}</h4>
            </div>
            <div className="card-body">
              {isInstructor ? (
                <div>
                  <p>
                    <strong>Student ID:</strong> {result.userId.substring(0, 8)}...
                  </p>
                  <p>
                    <strong>Assessment Performance:</strong> {percentage}% ({performance.label})
                  </p>
                  <p>
                    <strong>Completion Time:</strong> {new Date(result.attemptDate).toLocaleString()}
                  </p>
                  
                  <div className="alert alert-info">
                    <p className="mb-0">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      This student has completed {/* Mock data */} 3 assessments in this course.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="alert alert-info mb-3">
                    <p className="mb-0">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      Your instructor may provide additional feedback on this assessment.
                    </p>
                  </div>
                  
                  <p>
                    <strong>Performance:</strong> {percentage}% ({performance.label})
                  </p>
                  
                  <p>
                    <strong>Recommendation:</strong> {percentage < 70 ? 'Review course materials and attempt again.' : 'Great job! Continue to the next module.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDetail;
