// User Service
import { apiClient } from './api';
import { debugLog, errorLog } from '../config';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  size: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export const userService = {
  // Get all users (Admin only)
  getUsers: async (params?: {
    skip?: number;
    limit?: number;
    role?: string;
    is_active?: boolean;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/api/v1/users/', { params });
    return response.data;
  },

  // Get students created by current teacher
  getMyStudents: async (params?: {
    skip?: number;
    limit?: number;
  }): Promise<UserListResponse> => {
    const response = await apiClient.get('/api/v1/users/my-students', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/api/v1/users/', userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, userData: Partial<CreateUserRequest>): Promise<User> => {
    const response = await apiClient.put(`/api/v1/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/users/${userId}`);
  },
};
