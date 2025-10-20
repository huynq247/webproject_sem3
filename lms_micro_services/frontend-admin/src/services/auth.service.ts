// Authentication Service
import { apiClient } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
  };
}

export const authService = {
  // Login user
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', credentials);
    const authData = response.data;
    
    // Decode JWT to get user info
    if (authData.access_token) {
      try {
        const payload = JSON.parse(atob(authData.access_token.split('.')[1]));
        authData.user = {
          id: parseInt(payload.sub),
          username: payload.username,
          email: `${payload.username}@example.com`, // Fallback since not in JWT
          full_name: payload.username,
          role: payload.role,
          is_active: true
        };
      } catch (error) {
        console.warn('Failed to decode JWT:', error);
      }
    }
    
    return authData;
  },

  // Register new user
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<RegisterRequest>) => {
    const response = await apiClient.put('/api/v1/auth/profile', userData);
    return response.data;
  },

  // Logout user
  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/logout');
    return response.data;
  },
};
