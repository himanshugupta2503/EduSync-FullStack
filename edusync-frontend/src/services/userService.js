import api from './api';

const UserService = {
  // Get all users (admin/instructor only)
  getAllUsers: async () => {
    try {
      const response = await api.get('/Users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/Users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      // Format the data with PascalCase property names for .NET backend
      const formattedData = {
        Name: userData.name,
        Email: userData.email,
        Role: userData.role,
        // Only include password if it's being updated
        ...(userData.password && { Password: userData.password })
      };
      
      const response = await api.put(`/Users/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/Users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
};

export default UserService;
