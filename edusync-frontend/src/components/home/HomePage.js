import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import courseService from '../../services/courseService';
import './HomePage.css';

const HomePage = () => {
  const { currentUser, isInstructor, isStudent } = useContext(AuthContext);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Demo courses in case no courses are found in the database
  const demoCourses = [
    { 
      courseId: '1', 
      title: 'Introduction to React', 
      description: 'Learn the fundamentals of React, including components, state, props, and hooks.',
      category: 'Programming',
      instructor: 'John Smith',
      duration: '6 weeks'
    },
    { 
      courseId: '2', 
      title: 'Advanced JavaScript', 
      description: 'Master advanced JavaScript concepts like closures, prototypes, and async programming.',
      category: 'Programming',
      instructor: 'Emily Johnson',
      duration: '8 weeks'
    },
    { 
      courseId: '3', 
      title: 'Data Science with Python', 
      description: 'Learn how to analyze and visualize data using Python libraries like Pandas and Matplotlib.',
      category: 'Data Science',
      instructor: 'Michael Brown',
      duration: '10 weeks'
    },
    { 
      courseId: '4', 
      title: 'Web Design Fundamentals', 
      description: 'Learn the principles of effective web design, including layout, typography, and color theory.',
      category: 'Design',
      instructor: 'Sarah Wilson',
      duration: '5 weeks'
    },
    { 
      courseId: '5', 
      title: 'Business Analytics', 
      description: 'Learn how to use data to drive business decisions and strategy.',
      category: 'Business',
      instructor: 'David Miller',
      duration: '7 weeks'
    },
    { 
      courseId: '6', 
      title: 'Machine Learning Basics', 
      description: 'An introduction to machine learning algorithms and their applications.',
      category: 'Data Science',
      instructor: 'Jessica Lee',
      duration: '9 weeks'
    },
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch all courses
        const coursesData = await courseService.getAllCourses();
        
        // If we have courses from the database, use those; otherwise use demo courses
        if (coursesData && coursesData.length > 0) {
          setAllCourses(coursesData);
        } else {
          setAllCourses(demoCourses);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Using demo courses instead.');
        setAllCourses(demoCourses);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section py-5 bg-primary text-white text-center">
        <div className="container py-4">
          <h1 className="display-4 fw-bold mb-3">Welcome to EduSync Learning Platform</h1>
          <p className="lead mb-4">Discover courses taught by expert instructors in various fields</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/courses" className="btn btn-light btn-lg">
              Browse All Courses
            </Link>
            {!currentUser && (
              <Link to="/register" className="btn btn-outline-light btn-lg">
                Sign Up for Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Featured Courses</h2>
          <div className="row g-4">
            {allCourses.map(course => (
              <div key={course.courseId} className="col-md-6 col-lg-4">
                <div className="card course-card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <div className="mb-3 text-primary">
                      <i className="bi bi-book-half me-2"></i>
                      <span className="badge bg-light text-primary">{course.category || 'Course'}</span>
                    </div>
                    <h5 className="card-title">{course.title}</h5>
                    <p className="card-text text-muted mb-4">
                      {course.description?.substring(0, 100)}...
                    </p>
                    <div className="mt-auto">
                      {course.instructor && (
                        <p className="text-muted small mb-2">
                          <i className="bi bi-person me-1"></i>
                          Instructor: {course.instructor}
                        </p>
                      )}
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {course.duration || '4 weeks'}
                        </span>
                        <Link to={`/courses/${course.courseId}`} className="btn btn-sm btn-primary">
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container py-4">
          <h2 className="mb-3">Ready to start learning?</h2>
          <p className="lead mb-4">Join thousands of students already learning on EduSync</p>
          {currentUser ? (
            <Link to="/courses" className="btn btn-light btn-lg px-4">
              Browse All Courses
            </Link>
          ) : (
            <div className="d-flex justify-content-center gap-3">
              <Link to="/login" className="btn btn-light btn-lg px-4">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline-light btn-lg px-4">
                Register
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
