import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout, isInstructor, isStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/home">
          <i className="bi bi-book me-2"></i>
          EduSync LMS
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!currentUser ? (
              // Not logged in links
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            ) : (
              // Logged in links
              <>
                {/* Common links for all users */}
                <li className="nav-item">
                  <Link className="nav-link" to="/courses">Courses</Link>
                </li>

                {/* Student specific links */}
                {isStudent && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/student/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/student/assessments">My Assessments</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/student/results">My Results</Link>
                    </li>
                  </>
                )}

                {/* Instructor specific links */}
                {isInstructor && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/instructor/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/instructor/courses">Manage Courses</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/instructor/assessments">Manage Assessments</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/instructor/results">Student Results</Link>
                    </li>
                  </>
                )}

                {/* User profile and logout dropdown */}
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {currentUser.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>Profile
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
