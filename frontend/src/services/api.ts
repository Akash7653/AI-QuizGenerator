import axios from 'axios';

const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const baseUrl = configuredBaseUrl ? configuredBaseUrl.replace(/\/+$/, '') : 'http://localhost:8000';

  if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
    return `${baseUrl.replace(/\/+$/, '')}/api/v1`;
  }

  return `${baseUrl.replace(/\/+$/, '')}/api/v1`;
};

const baseURL = getApiBaseUrl();

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quizgen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('quizgen_token');
      localStorage.removeItem('quizgen_auth');
    }
    return Promise.reject(error);
  },
);
