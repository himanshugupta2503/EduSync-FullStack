import React, { useState, useEffect, useContext, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import { toast } from 'react-toastify';

const CourseList = () => {
  const { currentUser, isInstructor } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Handle course deletion confirmation modal
  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowConfirmModal(true);
  };

  // Handle actual course deletion
  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    
    setDeleting(true);
    try {
      await courseService.deleteCourse(courseToDelete.courseId);
      // Update courses list after deletion
      setCourses(courses.filter(c => c.courseId !== courseToDelete.courseId));
      toast.success(`Course "${courseToDelete.title}" has been deleted`);
      setShowConfirmModal(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Close confirmation modal
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setCourseToDelete(null);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <Fragment>
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col">
            <h1>Courses</h1>
            <p className="text-muted">Browse all available courses</p>
          </div>
          {isInstructor && (
            <div className="col-auto">
              <Link to="/instructor/courses/create" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Create New Course
              </Link>
            </div>
          )}
        </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm('')}
              >
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Course Cards */}
      {filteredCourses.length === 0 ? (
        <div className="alert alert-info">
          {searchTerm 
            ? 'No courses match your search criteria.' 
            : 'No courses available at the moment.'}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredCourses.map(course => (
            <div className="col" key={course.courseId}>
              <div className="card h-100 shadow-sm">
                <div className="card-img-top bg-light" style={{height: '160px'}}>
                  {course.mediaUrl ? (
                    <img 
                      src={course.mediaUrl} 
                      className="img-fluid h-100 w-100 object-fit-cover" 
                      alt={course.title} 
                    />
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
                <div className="card-footer bg-white border-top-0">
                  <div className="d-flex justify-content-between">
                    <Link 
                      to={`/courses/${course.courseId}`} 
                      className="btn btn-outline-primary flex-grow-1 me-2"
                    >
                      View Course
                    </Link>
                    
                    {/* Only show delete button for instructors and their own courses */}
                    {isInstructor && currentUser?.id === course.instructorId && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteClick(course)}
                        aria-label="Delete course"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleCloseModal} disabled={deleting}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete the course <strong>{courseToDelete?.title}</strong>?</p>
                <p className="text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={deleting}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleConfirmDelete} 
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

export default CourseList;
