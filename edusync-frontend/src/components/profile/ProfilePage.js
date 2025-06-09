import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, updateUserData } = useContext(AuthContext);
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        role: currentUser.role || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!userData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!userData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (userData.newPassword) {
      if (userData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (!userData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (userData.newPassword !== userData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Only include password fields if changing password
      const updateData = {
        name: userData.name,
        email: userData.email,
        role: userData.role
      };
      
      if (userData.newPassword) {
        updateData.currentPassword = userData.currentPassword;
        updateData.password = userData.newPassword;
      }
      
      // Call API to update user data
      const response = await userService.updateUser(currentUser.userId, updateData);
      
      // Update local user data
      updateUserData({
        ...currentUser,
        name: userData.name,
        email: userData.email
      });
      
      toast.success('Profile updated successfully');
      setEditing(false);
      
      // Clear password fields
      setUserData({
        ...userData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="profile-container container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">My Profile</h4>
              {!editing && (
                <button 
                  className="btn btn-light btn-sm" 
                  onClick={() => setEditing(true)}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {!editing ? (
                <div className="profile-info">
                  <div className="profile-avatar mb-4 text-center">
                    <div className="avatar-circle bg-primary text-white">
                      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="mt-3">{currentUser?.name}</h3>
                    <span className="badge bg-info">{currentUser?.role}</span>
                  </div>
                  
                  <div className="profile-details">
                    <div className="mb-3">
                      <label className="fw-bold">Email:</label>
                      <p>{currentUser?.email}</p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="fw-bold">User ID:</label>
                      <p>{currentUser?.userId}</p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="fw-bold">Account Type:</label>
                      <p>{currentUser?.role}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={userData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={userData.role}
                      disabled
                    />
                    <small className="text-muted">Role cannot be changed</small>
                  </div>
                  
                  <hr className="my-4" />
                  <h5>Change Password</h5>
                  <p className="text-muted small mb-3">Leave blank if you don't want to change your password</p>
                  
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      id="currentPassword"
                      name="currentPassword"
                      value={userData.currentPassword}
                      onChange={handleChange}
                    />
                    {errors.currentPassword && <div className="invalid-feedback">{errors.currentPassword}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                      id="newPassword"
                      name="newPassword"
                      value={userData.newPassword}
                      onChange={handleChange}
                    />
                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary" 
                      onClick={() => setEditing(false)}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
