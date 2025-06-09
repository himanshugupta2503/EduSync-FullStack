import api from './api';

const CourseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await api.get('/Courses');
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await api.get(`/Courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },

  // Create new course (Instructor only)
  createCourse: async (courseData) => {
    try {
      // Step 1: Log the incoming data for debugging
      console.log('Raw course data received:', JSON.stringify(courseData, null, 2));
      
      // Step 2: Format the data with PascalCase property names for .NET backend
      const formattedData = {
        Title: courseData.title || '',
        Description: courseData.description || '',
        InstructorId: courseData.instructorId
      };
      
      // Step 3: Handle the mediaUrl field specifically
      if (courseData.mediaUrl && courseData.mediaUrl.trim() !== '') {
        formattedData.MediaUrl = courseData.mediaUrl;
        console.log('MediaUrl being sent to backend:', formattedData.MediaUrl);
      } else {
        console.log('No MediaUrl to send - field will be empty');
      }
      
      // Step 4: Add any other optional fields
      if (courseData.duration) formattedData.Duration = courseData.duration;
      if (courseData.startDate) formattedData.StartDate = courseData.startDate;
      if (courseData.enrollmentLimit) formattedData.EnrollmentLimit = courseData.enrollmentLimit;
      
      // Step 5: Send request to the backend
      console.log('Sending formatted data to backend:', JSON.stringify(formattedData, null, 2));
      
      const response = await api.post('/Courses', formattedData);
      
      // Step 6: Log successful response
      console.log('Course creation successful! Response:', response.data);
      return response.data;
    } catch (error) {
      // Step 7: Enhanced error logging
      console.error('❌ ERROR CREATING COURSE ❌');
      console.error('Original request data:', courseData);
      console.error('Error object:', error);
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received from server. Request:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw error;
    }
  },

  // Update course (Instructor only)
  updateCourse: async (id, courseData) => {
    try {
      // Format the data with PascalCase property names for .NET backend
      const formattedData = {
        Title: courseData.title,
        Description: courseData.description,
        InstructorId: courseData.instructorId
      };
      
      // Add optional fields only if they exist in courseData
      if (courseData.mediaUrl) formattedData.MediaUrl = courseData.mediaUrl;
      if (courseData.duration) formattedData.Duration = courseData.duration;
      if (courseData.startDate) formattedData.StartDate = courseData.startDate;
      if (courseData.enrollmentLimit) formattedData.EnrollmentLimit = courseData.enrollmentLimit;
      
      console.log(`Updating course ${id} with data:`, formattedData);
      const response = await api.put(`/Courses/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating course ${id}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Delete course (Instructor only)
  deleteCourse: async (id) => {
    try {
      const response = await api.delete(`/Courses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting course ${id}:`, error);
      throw error;
    }
  },
  
  // Test YouTube URL handling directly
  testYoutubeUrl: async (url) => {
    try {
      console.log('Testing YouTube URL handling with:', url);
      const response = await api.post('/Courses/test-youtube', { url });
      console.log('YouTube URL test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('YouTube URL test failed:', error);
      throw error;
    }
  },

  // Upload media file to blob storage
  uploadMedia: async (formData, onProgress) => {
    try {
      console.log('Starting media upload process...');
      // Log the file being uploaded
      const file = formData.get('file');
      if (file) {
        console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes', 'Type:', file.type);
      } else {
        console.warn('No file found in FormData');
      }
      
      // Create custom Axios request config to track upload progress
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      };
      
      // Try the simplified upload endpoint first
      try {
        console.log('Trying simplified upload endpoint...');
        const response = await api.post('/Courses/simple-upload', formData, config);
        console.log('Simplified upload successful! Response:', response.data);
        return response.data;
      } catch (simpleError) {
        console.warn('Simplified upload failed, falling back to standard endpoint...', simpleError);
        
        // Fall back to original endpoint if simplified fails
        console.log('Sending file to /Courses/upload-media endpoint...');
        const response = await api.post('/Courses/upload-media', formData, config);
        console.log('Upload successful! Server response:', response.data);
        
        // Ensure the response has the expected structure
        if (!response.data || !response.data.mediaUrl) {
          console.warn('Server response is missing mediaUrl property:', response.data);
          // Try to extract mediaUrl if it's directly in the response data
          if (typeof response.data === 'string') {
            return { mediaUrl: response.data };
          } else if (response.data && typeof response.data === 'object') {
            // Search for any property that might contain the URL
            const possibleUrlKeys = Object.keys(response.data).find(key => 
              typeof response.data[key] === 'string' && 
              (response.data[key].includes('http') || response.data[key].includes('blob'))
            );
            
            if (possibleUrlKeys) {
              return { mediaUrl: response.data[possibleUrlKeys] };
            }
          }
          
          // If we still can't find a URL, construct a default object
          return { mediaUrl: 'Error: URL not found in response' };
        }
        
        return response.data;
      }
    } catch (error) {
      console.error('❌ ERROR UPLOADING MEDIA ❌');
      console.error('Error object:', error);
      
      // Try to diagnose the Azure Blob Storage connection
      try {
        console.log('Testing Azure Blob Storage connection...');
        await api.get('/Courses/test-blob');
      } catch (testError) {
        console.error('Blob storage test also failed:', testError);
      }
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received from server. Request:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      throw new Error('Failed to upload media: ' + (error.response?.data?.message || error.message));
    }
  }
};

export default CourseService;
