// Assignment Service
import { apiClient } from './api';
import { debugLog, errorLog } from '../config';

export interface Assignment {
  id: number;
  instructor_id: number;
  instructor_name?: string;
  student_id: number;
  student_name?: string;
  content_type: 'course' | 'deck';
  content_id: string;
  content_title: string;
  title: string;
  description?: string;
  instructions?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigned_at: string;
  due_date?: string;
  completed_at?: string;
  is_active: boolean;
  course_progress_percentage?: number;
  total_lessons?: number;
  completed_lessons?: number;
  supporting_decks?: string[]; // Array of deck IDs for course assignments
  supporting_deck_titles?: string[]; // Array of deck titles for display
  created_at: string;
  updated_at?: string;
}

export interface CreateAssignmentRequest {
  instructor_id: number;
  student_id: number;
  content_type: 'course' | 'deck';
  content_id: string;
  content_title: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date?: string;
  supporting_decks?: string[]; // Optional supporting deck IDs
  supporting_deck_titles?: string[]; // Optional supporting deck titles
}

export const assignmentService = {
  createAssignment: async (assignment: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await apiClient.post('/api/assignments/', assignment);
    return response.data;
  },

  getAssignments: async (params?: { 
    student_id?: number;
    instructor_id?: number;
    page?: number; 
    size?: number;
  }): Promise<{
    assignments: Assignment[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
  }> => {
    const { student_id, instructor_id, page = 1, size = 10 } = params || {};
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(student_id && { student_id: student_id.toString() }),
      ...(instructor_id && { instructor_id: instructor_id.toString() })
    });
    const response = await apiClient.get(`/api/assignments/?${queryParams.toString()}`);
    return response.data;
  },

  getAssignment: async (assignmentId: number): Promise<Assignment> => {
    const response = await apiClient.get(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  updateAssignment: async (assignmentId: number, assignmentData: Partial<CreateAssignmentRequest>): Promise<Assignment> => {
    const response = await apiClient.put(`/api/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },

  updateAssignmentStatus: async (assignmentId: number, status: 'pending' | 'in_progress' | 'completed' | 'overdue'): Promise<Assignment> => {
    const response = await apiClient.put(`/api/assignments/${assignmentId}`, { status });
    return response.data;
  },

  deleteAssignment: async (assignmentId: number): Promise<void> => {
    await apiClient.delete(`/api/assignments/${assignmentId}`);
  }
};
