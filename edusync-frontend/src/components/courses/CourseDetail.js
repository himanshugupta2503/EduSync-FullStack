import React, { useState, useEffect, useContext, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import assessmentService from '../../services/assessmentService';

const CourseDetail = () => {
  const { courseId } = useParams();
  const { currentUser, isInstructor } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseData = await courseService.getCourseById(courseId);
        setCourse(courseData);
        
        // Fetch assessments for this course
        const allAssessments = await assessmentService.getAllAssessments();
        const courseAssessments = allAssessments.filter(
          assessment => assessment.courseId === courseId
        );
        setAssessments(courseAssessments);
        
      } catch (err) {
        console.error('Error fetching course data:', err);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // Show delete confirmation modal
  const showDeleteConfirmation = () => {
    setShowDeleteModal(true);
  };
  
  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
  };
  
  // Handle actual course deletion
  const handleDeleteCourse = async () => {
    setDeleting(true);
    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      // Navigate after successful deletion
      navigate('/courses');
    } catch (error) {
      toast.error('Failed to delete course. Please try again.');
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
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

  if (!course) {
    return (
      <div className="alert alert-warning my-5" role="alert">
        Course not found. <Link to="/courses">Return to course list</Link>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="container py-5">
      {/* Course Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/courses">Courses</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{course.title}</li>
            </ol>
          </nav>
          <h1 className="mb-2">{course.title}</h1>
          <p className="text-muted mb-0">Course ID: {course.courseId}</p>
        </div>
        
        {/* Action buttons for instructors */}
        {isInstructor && currentUser?.userId === course.instructorId && (
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <Link to={`/instructor/courses/edit/${courseId}`} className="btn btn-primary me-2">
              <i className="bi bi-pencil me-2"></i>Edit Course
            </Link>
            <button 
              className="btn btn-danger"
              onClick={showDeleteConfirmation}
            >
              <i className="bi bi-trash me-2"></i>Delete
            </button>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="row">
        {/* Main Content */}
        <div className="col-lg-8">
          <div className="card mb-4 shadow-sm">
            <div className="card-body">
              <h4 className="card-title">Description</h4>
              <p className="card-text">{course.description}</p>
              
              {course.mediaUrl && (
                <div className="mt-4">
                  <h4>Course Media</h4>
                  <div className="ratio ratio-16x9 mt-3">
                    <iframe 
                      src={course.mediaUrl} 
                      title={course.title}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessments */}
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Assessments</h4>
              {isInstructor && currentUser?.userId === course.instructorId && (
                <Link 
                  to={`/instructor/assessments/create?courseId=${courseId}`} 
                  className="btn btn-sm btn-primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Assessment
                </Link>
              )}
            </div>
            <div className="card-body">
              {assessments.length === 0 ? (
                <div className="alert alert-info">
                  No assessments available for this course yet.
                </div>
              ) : (
                <div className="list-group">
                  {assessments.map(assessment => (
                    <div 
                      key={assessment.assessmentId} 
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h5 className="mb-1">{assessment.title}</h5>
                        <small className="text-muted">Max score: {assessment.maxScore} points</small>
                      </div>
                      <div>
                        {isInstructor && currentUser?.userId === course.instructorId ? (
                          <Link 
                            to={`/instructor/assessments/${assessment.assessmentId}`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            Manage
                          </Link>
                        ) : (
                          <Link 
                            to={`/student/assessments/${assessment.assessmentId}`} 
                            className="btn btn-sm btn-primary"
                          >
                            Start
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Course Information</h4>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Instructor</span>
                  <span className="fw-bold">
                    {/* In a real app, get instructor name from API */}
                    {isInstructor && currentUser?.userId === course.instructorId 
                      ? 'You' 
                      : 'Instructor Name'}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Assessments</span>
                  <span className="badge bg-primary rounded-pill">{assessments.length}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  <span>Enrolled Students</span>
                  {/* Mock data - in a real app, get actual count from API */}
                  <span className="badge bg-info rounded-pill">24</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions for students */}
          {!isInstructor && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Course Actions</h5>
                {/* In a real app, check if student is enrolled and show appropriate button */}
                <button className="btn btn-success w-100 mb-3">
                  <i className="bi bi-person-check me-2"></i>Enroll in Course
                </button>
                {assessments.length > 0 && (
                  <Link 
                    to={`/student/assessments/${assessments[0].assessmentId}`} 
                    className="btn btn-primary w-100"
                  >
                    <i className="bi bi-journal-check me-2"></i>Start First Assessment
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Course Deletion</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  aria-label="Close" 
                  onClick={closeDeleteModal} 
                  disabled={deleting}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the course <strong>{course?.title}</strong>?</p>
                <p className="text-danger">This action cannot be undone and will remove all associated content.</p>
                
                {course?.assessments?.length > 0 && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    This course has {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} that will also be deleted.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeDeleteModal} 
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDeleteCourse} 
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Deleting...
                    </>
                  ) : 'Delete Course'}
                </button>
              </div>
            </div>
        </div>
      </div>
      )}
    </Fragment>
  );
};

export default CourseDetail;
