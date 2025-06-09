import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Private route component to restrict access to authenticated users
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Role-based route component to restrict access to specific user roles
export const RoleRoute = ({ allowedRoles }) => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  // Check if user has an allowed role
  const hasAllowedRole = currentUser && allowedRoles.includes(currentUser.role);
  
  return hasAllowedRole ? <Outlet /> : <Navigate to="/" />;
};
