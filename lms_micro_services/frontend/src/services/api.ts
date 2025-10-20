// API Base Configuration
import axios from 'axios';
import { config, debugLog, errorLog } from '../config';

export const apiClient = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    debugLog('🌐 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    errorLog('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    debugLog('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    errorLog('❌ Response Error:', error.response?.status, error.config?.url, error.message);
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      errorLog('🔒 Unauthorized access, redirecting to login');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
