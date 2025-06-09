import api from './api';

const AuthService = {
  // Register a new user
  register: async (userData) => {
    try {
      // Detailed logging of the request data
      console.log('Registering with data:', userData);
      console.log('Request properties:', Object.keys(userData));
      
      // Format validation check
      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        console.warn('Registration data validation failed - missing required fields');
        console.warn('Required: name, email, password, role');
        console.warn('Received:', Object.keys(userData));
      }
      
      // Capital case the property names to match backend DTO
      const formattedData = {
        Name: userData.name,
        Email: userData.email,
        Password: userData.password,
        Role: userData.role
      };
      
      console.log('Sending formatted data to backend:', formattedData);
      
      // Make the API call with properly formatted data
      const response = await api.post('/Auth/register', formattedData);
      console.log('Registration response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Convert backend user format to our frontend format
        const user = {
          userId: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };
        
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      console.log('Logging in with credentials:', { email: credentials.email });
      
      // Format credentials to match backend DTO (capital property names)
      const formattedCredentials = {
        Email: credentials.email,
        Password: credentials.password
      };
      
      console.log('Sending formatted login data:', formattedCredentials);
      
      const response = await api.post('/Auth/login', formattedCredentials);
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Convert backend user format to our frontend format
        const user = {
          userId: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role
        };
        
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user info
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;
