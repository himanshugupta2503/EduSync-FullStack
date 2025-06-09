import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import assessmentService from '../../services/assessmentService';
import courseService from '../../services/courseService';

const AssessmentForm = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!assessmentId;

  // Get courseId from query params if available (for creating assessment from course page)
  const queryParams = new URLSearchParams(location.search);
  const preselectedCourseId = queryParams.get('courseId');

  const [formData, setFormData] = useState({
    title: '',
    courseId: preselectedCourseId || '',
    maxScore: 100,
    questions: []
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setInitialLoading(true);
        
        // Fetch available courses
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
        
        // If editing, fetch assessment data
        if (isEditMode) {
          const assessmentData = await assessmentService.getAssessmentById(assessmentId);
          
          setFormData({
            title: assessmentData.title,
            courseId: assessmentData.courseId,
            maxScore: assessmentData.maxScore,
            questions: assessmentData.questions ? JSON.parse(assessmentData.questions) : []
          });
        }
      } catch (err) {
        console.error('Error initializing form:', err);
        toast.error('Failed to load form data');
      } finally {
        setInitialLoading(false);
      }
    };

    initializeForm();
  }, [assessmentId, isEditMode, preselectedCourseId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          options: ['', '', '', ''],
          correctAnswer: '0',
          points: 10
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Assessment title is required';
    }
    
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    
    if (formData.maxScore <= 0) {
      newErrors.maxScore = 'Maximum score must be greater than 0';
    }
    
    if (formData.questions.length === 0) {
      newErrors.questions = 'Assessment must have at least one question';
    } else {
      const questionErrors = [];
      
      formData.questions.forEach((question, index) => {
        const qErrors = {};
        
        if (!question.questionText.trim()) {
          qErrors.questionText = 'Question text is required';
        }
        
        const emptyOptions = question.options.filter(opt => !opt.trim()).length;
        if (emptyOptions > 0) {
          qErrors.options = 'All options must be filled in';
        }
        
        if (qErrors.questionText || qErrors.options) {
          questionErrors[index] = qErrors;
        }
      });
      
      if (questionErrors.length > 0) {
        newErrors.questionErrors = questionErrors;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare the assessment data with properly formatted fields
      const assessmentData = {
        title: formData.title,
        courseId: formData.courseId,
        maxScore: parseInt(formData.maxScore) || 100,
        // Format questions to ensure they have all required fields
        questions: formData.questions.map(q => ({
          questionText: q.questionText || '',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer || '0',
          points: parseInt(q.points) || 10
        }))
      };
      
      console.log('Submitting assessment data:', assessmentData);
      
      if (isEditMode) {
        await assessmentService.updateAssessment(assessmentId, {
          assessmentId,
          ...assessmentData
        });
        toast.success('Assessment updated successfully');
      } else {
        await assessmentService.createAssessment(assessmentData);
        toast.success('Assessment created successfully');
      }
      
      navigate('/instructor/assessments');
    } catch (error) {
      console.error('Assessment submission error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      toast.error(error.response?.data?.message || 'Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col">
          <h1>{isEditMode ? 'Edit Assessment' : 'Create New Assessment'}</h1>
          <p className="text-muted">
            {isEditMode 
              ? 'Update your assessment details and questions' 
              : 'Create a new assessment for your course'}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-9">
          <form onSubmit={handleSubmit}>
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white">
                <h4 className="mb-0">Assessment Details</h4>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Assessment Title*</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter assessment title"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="courseId" className="form-label">Course*</label>
                  <select
                    className={`form-select ${errors.courseId ? 'is-invalid' : ''}`}
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    disabled={isEditMode} // Don't allow changing course for existing assessment
                  >
                    <option value="">Select a course</option>
                    {courses.map(course => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {errors.courseId && <div className="invalid-feedback">{errors.courseId}</div>}
                </div>
                
                <div className="mb-3">
                  <label htmlFor="maxScore" className="form-label">Maximum Score*</label>
                  <input
                    type="number"
                    className={`form-control ${errors.maxScore ? 'is-invalid' : ''}`}
                    id="maxScore"
                    name="maxScore"
                    value={formData.maxScore}
                    onChange={handleChange}
                    min="1"
                  />
                  {errors.maxScore && <div className="invalid-feedback">{errors.maxScore}</div>}
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Total points for the entire assessment.
                  </div>
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Questions</h4>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm"
                  onClick={addQuestion}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Add Question
                </button>
              </div>
              <div className="card-body">
                {errors.questions && (
                  <div className="alert alert-danger mb-3">
                    {errors.questions}
                  </div>
                )}
                
                {formData.questions.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="bi bi-clipboard-plus text-muted fs-1"></i>
                    </div>
                    <p className="text-muted mb-3">No questions added yet.</p>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={addQuestion}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Your First Question
                    </button>
                  </div>
                ) : (
                  <div className="accordion" id="questionsAccordion">
                    {formData.questions.map((question, questionIndex) => (
                      <div className="accordion-item mb-3 border" key={questionIndex}>
                        <h2 className="accordion-header" id={`heading${questionIndex}`}>
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse${questionIndex}`}
                            aria-expanded={questionIndex === 0}
                            aria-controls={`collapse${questionIndex}`}
                          >
                            <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                              <span>
                                Question {questionIndex + 1}: 
                                {question.questionText 
                                  ? ` ${question.questionText.substring(0, 50)}${question.questionText.length > 50 ? '...' : ''}` 
                                  : ' (No text)'}
                              </span>
                              <span className="badge bg-primary">{question.points} points</span>
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
                            <div className="mb-3">
                              <label htmlFor={`question${questionIndex}`} className="form-label">Question Text*</label>
                              <textarea
                                className={`form-control ${errors.questionErrors?.[questionIndex]?.questionText ? 'is-invalid' : ''}`}
                                id={`question${questionIndex}`}
                                rows="2"
                                value={question.questionText}
                                onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                                placeholder="Enter your question here"
                              ></textarea>
                              {errors.questionErrors?.[questionIndex]?.questionText && (
                                <div className="invalid-feedback">
                                  {errors.questionErrors[questionIndex].questionText}
                                </div>
                              )}
                            </div>
                            
                            <div className="mb-3">
                              <label className="form-label">Options*</label>
                              <div className={errors.questionErrors?.[questionIndex]?.options ? 'is-invalid' : ''}>
                                {question.options.map((option, optionIndex) => (
                                  <div className="input-group mb-2" key={optionIndex}>
                                    <div className="input-group-text">
                                      <input
                                        type="radio"
                                        name={`correctAnswer${questionIndex}`}
                                        checked={question.correctAnswer === optionIndex.toString()}
                                        onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex.toString())}
                                        aria-label={`Option ${optionIndex + 1} is correct`}
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder={`Option ${optionIndex + 1}`}
                                      value={option}
                                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                    />
                                  </div>
                                ))}
                              </div>
                              {errors.questionErrors?.[questionIndex]?.options && (
                                <div className="invalid-feedback d-block">
                                  {errors.questionErrors[questionIndex].options}
                                </div>
                              )}
                              <div className="form-text">
                                <i className="bi bi-info-circle me-1"></i>
                                Select the radio button next to the correct answer.
                              </div>
                            </div>
                            
                            <div className="row mb-3">
                              <div className="col-md-6">
                                <label htmlFor={`points${questionIndex}`} className="form-label">Points*</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  id={`points${questionIndex}`}
                                  value={question.points}
                                  onChange={(e) => handleQuestionChange(questionIndex, 'points', parseInt(e.target.value) || 0)}
                                  min="1"
                                />
                              </div>
                            </div>
                            
                            <div className="text-end">
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => removeQuestion(questionIndex)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Remove Question
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {formData.questions.length > 0 && (
                  <div className="text-center mt-3">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={addQuestion}
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      Add Another Question
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="d-flex justify-content-between">
              <Link to="/instructor/assessments" className="btn btn-outline-secondary">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditMode ? 'Update Assessment' : 'Create Assessment'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="col-lg-3">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Tips</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Keep questions clear and concise
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Provide 4 distinct options for each question
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Assign points based on difficulty
                </li>
                <li className="list-group-item">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Ensure total points match max score
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentForm;
