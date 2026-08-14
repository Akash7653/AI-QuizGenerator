import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests for session-based auth
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    console.log(`[API] Response data:`, response.data);
    return response;
  },
  async (error) => {
    // Suppress connection refused errors on startup (backend may be starting)
    if (error.code === 'ERR_NETWORK' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      console.debug('[API] Connection refused - backend may be starting');
      return Promise.reject(error);
    }

    const errorMsg = `[API] Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`;
    console.error(errorMsg, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: { name: string; email: string; password: string; role: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: { name?: string; email?: string; profile_image?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changeEmail: async (newEmail: string) => {
    const response = await api.put('/auth/profile/email', { new_email: newEmail });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },
};

export const quizAPI = {
  getHistory: async (skip = 0, limit = 100) => {
    const response = await api.get(`/quiz/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  submitQuiz: async (data: { quiz_id: number; answers: Record<string, string>; time_taken: number }) => {
    const response = await api.post('/quiz/submit', data);
    return response.data;
  },

  quickSaveQuiz: async (data: {
    topic: string;
    source_type: string;
    score: number;
    total_questions: number;
    difficulty: string;
    question_type: string;
    time_taken: number;
  }) => {
    const response = await api.post('/quiz/quick-save', data);
    return response.data;
  },

  generateQuiz: async (data: {
    document_id: number;
    mode: string;
    total_questions: number;
    difficulty?: string;
    question_types?: string[];
  }) => {
    const response = await api.post('/quiz/generate', data);
    return response.data;
  },

  generateFromTopic: async (data: {
    topic: string;
    name?: string;
    source_type?: string;
    difficulty?: string;
    total_questions?: number;
    question_type?: string;
    time_limit?: number;
  }) => {
    const response = await api.post('/quiz/generate-topic', data);
    return response.data;
  },
  
  createQuiz: async (data: {
    title: string;
    description?: string;
    mode: string;
    total_questions: number;
    question_ids?: number[];
  }) => {
    const response = await api.post('/quiz/create', data);
    return response.data;
  },
  
  startQuiz: async (quizId: number) => {
    const response = await api.post('/quiz/start', { quiz_id: quizId });
    return response.data;
  },
  
  getQuizResult: async (attemptId: number) => {
    const response = await api.get(`/quiz/result/${attemptId}`);
    return response.data;
  },
  
  getQuizHistory: async (skip = 0, limit = 100) => {
    const response = await api.get(`/quiz/history?skip=${skip}&limit=${limit}`);
    return response.data;
  },
};

export const documentAPI = {
  uploadDocument: async (file: File, title?: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    
    const response = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  createTopicDocument: async (data: { topic: string; description?: string }) => {
    const response = await api.post('/documents/topic', data);
    return response.data;
  },
  
  pasteText: async (data: { title: string; content: string; description?: string }) => {
    const response = await api.post('/documents/text', data);
    return response.data;
  },
  
  fetchURL: async (data: { url: string; title?: string; description?: string }) => {
    const response = await api.post('/documents/url', data);
    return response.data;
  },
  
  getDocuments: async (skip = 0, limit = 100) => {
    const response = await api.get(`/documents/?skip=${skip}&limit=${limit}`);
    return response.data;
  },
  
  deleteDocument: async (documentId: number) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export const analyticsAPI = {
  getDashboard: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
  
  getPerformance: async () => {
    const response = await api.get('/analytics/performance');
    return response.data;
  },
  
  getTopicPerformance: async () => {
    const response = await api.get('/analytics/topics');
    return response.data;
  },
};

export const recommendationAPI = {
  getRecommendations: async (type?: string) => {
    const params = type ? `?recommendation_type=${type}` : '';
    const response = await api.get(`/recommendation/${params}`);
    return response.data;
  },
  
  generateRecommendations: async () => {
    const response = await api.post('/recommendation/generate');
    return response.data;
  },
  
  getLearningPath: async () => {
    const response = await api.get('/recommendation/learning-path');
    return response.data;
  },
  
  completeRecommendation: async (recommendationId: number) => {
    const response = await api.post(`/recommendation/${recommendationId}/complete`);
    return response.data;
  },
};

export default api;
