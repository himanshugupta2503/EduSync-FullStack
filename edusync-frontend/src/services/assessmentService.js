import api from './api';

const AssessmentService = {
  // Get all assessments
  getAllAssessments: async () => {
    try {
      const response = await api.get('/Assessments');
      return response.data;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  // Get assessment by ID
  getAssessmentById: async (id) => {
    try {
      const response = await api.get(`/Assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  // Create new assessment (Instructor only)
  createAssessment: async (assessmentData) => {
    try {
      // Ensure courseId is a valid GUID string (required by backend)
      let courseId = assessmentData.courseId;
      
      // If not a valid GUID format and dropdown selection has a value property, use that
      if (typeof courseId === 'object' && courseId.value) {
        courseId = courseId.value;
      }
      
      // Format the data with PascalCase property names for .NET backend
      const formattedData = {
        Title: assessmentData.title || '',
        CourseId: courseId,
        MaxScore: parseInt(assessmentData.maxScore) || 100
      };
      
      // Format questions as a JSON string, which is what the backend expects
      if (assessmentData.questions && assessmentData.questions.length > 0) {
        // Make sure to clean up any undefined or null values before stringifying
        const cleanedQuestions = assessmentData.questions.map(q => ({
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options.map(o => o || '') : ['', '', '', ''],
          correctAnswer: q.correctAnswer || '0',
          points: parseInt(q.points) || 10
        }));
        formattedData.Questions = JSON.stringify(cleanedQuestions);
      } else {
        formattedData.Questions = "[]"; // Empty array in JSON format if no questions
      }
      
      console.log('Sending assessment data to backend:', formattedData);
      const response = await api.post('/Assessments', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating assessment:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Update assessment (Instructor only)
  updateAssessment: async (id, assessmentData) => {
    try {
      // Ensure courseId is a valid GUID string (required by backend)
      let courseId = assessmentData.courseId;
      
      // If not a valid GUID format and dropdown selection has a value property, use that
      if (typeof courseId === 'object' && courseId.value) {
        courseId = courseId.value;
      }
      
      // Format the data with PascalCase property names for .NET backend
      const formattedData = {
        Title: assessmentData.title || '',
        CourseId: courseId,
        MaxScore: parseInt(assessmentData.maxScore) || 100
      };
      
      // Include AssessmentId for update operations
      if (id) {
        formattedData.AssessmentId = id;
      }
      
      // Format questions as a JSON string, which is what the backend expects
      if (assessmentData.questions && assessmentData.questions.length > 0) {
        // Make sure to clean up any undefined or null values before stringifying
        const cleanedQuestions = assessmentData.questions.map(q => ({
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options.map(o => o || '') : ['', '', '', ''],
          correctAnswer: q.correctAnswer || '0',
          points: parseInt(q.points) || 10
        }));
        formattedData.Questions = JSON.stringify(cleanedQuestions);
      } else {
        formattedData.Questions = "[]"; // Empty array in JSON format if no questions
      }
      
      console.log(`Updating assessment ${id} with data:`, formattedData);
      const response = await api.put(`/Assessments/${id}`, formattedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating assessment ${id}:`, error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Delete assessment (Instructor only)
  deleteAssessment: async (id) => {
    try {
      const response = await api.delete(`/Assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting assessment ${id}:`, error);
      throw error;
    }
  },
  
  // Submit assessment answers (Student only)
  submitAssessment: async (assessmentId, answers) => {
    const response = await api.post(`/Results`, {
      assessmentId,
      answers
    });
    return response.data;
  }
};

export default AssessmentService;
