import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/minimalistic-theme.css'; // Import minimalistic theme (overrides Bootstrap)

// Import context providers
import { AuthProvider } from './context/AuthContext';

// Import layout components
import Navbar from './components/layout/Navbar';

// Import home page
import HomePage from './components/home/HomePage';

// Import profile page
import ProfilePage from './components/profile/ProfilePage';

// Import auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Import dashboard components
import StudentDashboard from './components/dashboard/StudentDashboard';
import InstructorDashboard from './components/dashboard/InstructorDashboard';

// Import course components
import CourseList from './components/courses/CourseList';
import CourseDetail from './components/courses/CourseDetail';
import CourseForm from './components/courses/CourseForm';

// Import assessment components
import AssessmentList from './components/assessments/AssessmentList';
import AssessmentDetail from './components/assessments/AssessmentDetail';
import AssessmentForm from './components/assessments/AssessmentForm';

// Import result components
import ResultList from './components/results/ResultList';
import ResultDetail from './components/results/ResultDetail';

// Import route guards
import { PrivateRoute, RoleRoute } from './utils/PrivateRoute';

// Home component - redirects to appropriate dashboard based on role
const Home = () => {
  const { currentUser, isInstructor, isStudent } = useContext(AuthContext);
  
  // If user is logged in, redirect to appropriate dashboard or courses
  if (currentUser) {
    if (isInstructor) {
      return <Navigate to="/instructor/dashboard" replace />
    } else if (isStudent) {
      return <Navigate to="/student/dashboard" replace />
    } else {
      return <Navigate to="/courses" replace />
    }
  }
  
  // If not logged in, show welcome page
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Welcome to EduSync</h1>
          <p className="lead mb-4">
            Smart Learning Management & Assessment Platform
          </p>
          <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
            <Link to="/login" className="btn btn-primary btn-lg px-4 gap-3">
              Login
            </Link>
            <Link to="/register" className="btn btn-outline-secondary btn-lg px-4">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Common private routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/courses" element={<CourseList />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              
              {/* Student routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<RoleRoute allowedRoles={['Student']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/assessments" element={<AssessmentList />} />
                  <Route path="/student/assessments/:assessmentId" element={<AssessmentDetail />} />
                  <Route path="/student/results" element={<ResultList />} />
                  <Route path="/student/results/:resultId" element={<ResultDetail />} />
                </Route>
              </Route>
              
              {/* Instructor routes */}
              <Route element={<PrivateRoute />}>
                <Route element={<RoleRoute allowedRoles={['Instructor']} />}>
                  <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                  <Route path="/instructor/courses" element={<CourseList />} />
                  <Route path="/instructor/courses/create" element={<CourseForm />} />
                  <Route path="/instructor/courses/edit/:courseId" element={<CourseForm />} />
                  <Route path="/instructor/assessments" element={<AssessmentList />} />
                  <Route path="/instructor/assessments/create" element={<AssessmentForm />} />
                  <Route path="/instructor/assessments/edit/:assessmentId" element={<AssessmentForm />} />
                  <Route path="/instructor/assessments/:assessmentId" element={<AssessmentDetail />} />
                  <Route path="/instructor/results" element={<ResultList />} />
                  <Route path="/instructor/results/:resultId" element={<ResultDetail />} />
                </Route>
              </Route>
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={
                <div className="container py-5 text-center">
                  <h1>404: Page Not Found</h1>
                  <p>The page you're looking for doesn't exist.</p>
                  <a href="/" className="btn btn-primary">Go Home</a>
                </div>
              } />
            </Routes>
          </main>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
