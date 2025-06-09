import api from './api';

const ResultService = {
  // Get all results (for instructors or for a student's own results)
  getAllResults: async () => {
    try {
      const response = await api.get('/Results');
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      throw error;
    }
  },

  // Get result by ID
  getResultById: async (id) => {
    try {
      const response = await api.get(`/Results/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching result ${id}:`, error);
      throw error;
    }
  },

  // Get results by user ID (for instructors to view student results)
  getResultsByUser: async (userId) => {
    try {
      const response = await api.get(`/Results/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching results for user ${userId}:`, error);
      throw error;
    }
  },

  // Get results by assessment ID
  getResultsByAssessment: async (assessmentId) => {
    try {
      const response = await api.get(`/Results/assessment/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching results for assessment ${assessmentId}:`, error);
      throw error;
    }
  },

  // Create new result (submit assessment)
  createResult: async (resultData) => {
    try {
      // Get current timestamp for the attempt date
      const attemptDate = new Date().toISOString();
      
      // Format the data with PascalCase property names for .NET backend
      const formattedData = {
        // Generate a new GUID for the result - using a simple UUID pattern
        ResultId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        }),
        UserId: resultData.userId,
        AssessmentId: resultData.assessmentId,
        Score: resultData.score,
        AttemptDate: attemptDate
      };
      
      // Convert answers from JSON string to object if needed
      if (typeof resultData.answers === 'string') {
        try {
          resultData.answers = JSON.parse(resultData.answers);
        } catch (e) {
          console.error('Error parsing answers JSON:', e);
        }
      }
      
      console.log('Submitting result data to backend:', formattedData);
      const response = await api.post('/Results', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error creating result:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};

export default ResultService;
