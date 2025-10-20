// Content Service
import { apiClient } from './api';
import { debugLog, errorLog, getApiUrl } from '../config';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  estimated_duration?: number;
  is_active: boolean;
  is_published?: boolean;
  lessons?: Lesson[]; // Optional for backward compatibility
  total_lessons?: number; // Number of lessons in course
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  instructor_id: number;
  order: number;
  duration?: number;
  image_url?: string;
  video_url?: string;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  is_public: boolean;
  is_published?: boolean; // Backend field
  flashcards?: Flashcard[];
  total_flashcards?: number;
  created_at: string;
  updated_at?: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  order: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  front_image_url?: string;
  back_image_url?: string;
  wordclass?: string;
  definition?: string;
  example?: string;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  instructor_id: string;
}

export interface CreateLessonRequest {
  course_id: string;
  title: string;
  content: string;
  order_index: number;
}

export interface CreateDeckRequest {
  title: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  instructor_id: number; // Should be number to match backend
  is_public?: boolean;
  is_published?: boolean; // Backend field
  category?: string;
  tags?: string[];
}

export interface CreateFlashcardRequest {
  deck_id: string;
  front: string;
  back: string;
  order: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  front_image_url?: string;
  back_image_url?: string;
  wordclass?: string;
  definition?: string;
  example?: string;
}

export const contentService = {
  // Courses
  getCourses: async (): Promise<{ courses: Course[] }> => {
    try {
      debugLog('� Fetching courses from API...');
      const response = await apiClient.get('/api/courses/?size=50'); // Increased page size
      debugLog('📦 Courses API Response:', response.data);
      debugLog('📋 Items count:', response.data.items?.length);
      
      // Backend returns { items: [...] }, frontend expects { courses: [...] }
      return { courses: response.data.items || [] };
    } catch (error) {
      errorLog('❌ Error fetching courses:', error);
      throw error;
    }
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const response = await apiClient.get(`/api/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData: CreateCourseRequest): Promise<Course> => {
    const response = await apiClient.post('/api/courses/', courseData);
    return response.data;
  },

  updateCourse: async (courseId: string, courseData: Partial<CreateCourseRequest>): Promise<Course> => {
    const response = await apiClient.put(`/api/courses/${courseId}`, courseData);
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/api/courses/${courseId}`);
  },

  // Lessons
  getLessons: async (courseId: string): Promise<{ lessons: Lesson[] }> => {
    const response = await apiClient.get(`/api/courses/${courseId}/lessons`);
    return response.data;
  },

  // Alias for getLessons for clarity
  getLessonsByCourse: async (courseId: string): Promise<Lesson[]> => {
    const response = await apiClient.get(`/api/courses/${courseId}/lessons`);
    return response.data.lessons || response.data.items || response.data;
  },

  getLessonById: async (lessonId: string): Promise<Lesson> => {
    const response = await apiClient.get(`/api/lessons/${lessonId}`);
    return response.data;
  },

  getAllLessons: async (params?: {
    search?: string;
    page?: number;
    size?: number;
    course_id?: string;
    instructor_id?: number;
    is_published?: boolean;
    is_active?: boolean;
  }): Promise<{
    items: Lesson[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }> => {
    const response = await apiClient.get('/api/lessons/', { params });
    return response.data;
  },

  createLesson: async (lessonData: CreateLessonRequest): Promise<Lesson> => {
    const response = await apiClient.post('/api/lessons/', lessonData);
    return response.data;
  },

  updateLesson: async (lessonId: string, lessonData: Partial<CreateLessonRequest>): Promise<Lesson> => {
    const response = await apiClient.put(`/api/lessons/${lessonId}`, lessonData);
    return response.data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await apiClient.delete(`/api/lessons/${lessonId}`);
  },

  assignLessonToCourse: async (courseId: string, lessonId: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/api/courses/${courseId}/lessons/${lessonId}/assign`);
    return response.data;
  },

  reorderLessons: async (courseId: string, items: { id: string; order: number }[]): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/courses/${courseId}/lessons/reorder`, { items });
    return response.data;
  },

  // Decks
  getDecks: async (): Promise<{ decks: Deck[] }> => {
    console.log('🔍 Getting decks...');
    const response = await apiClient.get('/api/decks/');
    console.log('📊 Get decks response:', response.data);
    
    // API returns paginated response with items array
    const result = {
      decks: response.data.items || []
    };
    console.log('🎯 Parsed decks:', result);
    return result;
  },

  getDeck: async (deckId: string): Promise<Deck> => {
    console.log('🔍 Getting deck:', deckId);
    const response = await apiClient.get(`/api/decks/${deckId}`);
    console.log('📊 Get deck response:', response.data);
    return response.data;
  },

  createDeck: async (deckData: CreateDeckRequest): Promise<Deck> => {
    console.log('🔍 Creating deck:', deckData);
    const response = await apiClient.post('/api/decks/', deckData);
    console.log('📊 Create deck response:', response.data);
    return response.data;
  },

  updateDeck: async (deckId: string, deckData: Partial<CreateDeckRequest>): Promise<Deck> => {
    const response = await apiClient.put(`/api/decks/${deckId}`, deckData);
    return response.data;
  },

  deleteDeck: async (deckId: string): Promise<void> => {
    await apiClient.delete(`/api/decks/${deckId}`);
  },

  // Flashcards
  getFlashcards: async (deckId: string): Promise<{ flashcards: Flashcard[] }> => {
    console.log('🔍 Getting flashcards for deck:', deckId);
    console.log('🌐 API call URL:', `/api/decks/${deckId}/flashcards`);
    
    try {
      const response = await apiClient.get(`/api/decks/${deckId}/flashcards`);
      console.log('📊 Flashcards raw response:', response.data);
      console.log('📊 Response type:', typeof response.data);
      console.log('📊 Is array:', Array.isArray(response.data));
      
      // API returns array directly, wrap it in object
      const result = { flashcards: response.data };
      console.log('🎯 Wrapped flashcards result:', result);
      console.log('🎯 Result flashcards count:', result.flashcards.length);
      return result;
    } catch (error) {
      console.error('❌ Flashcards API error:', error);
      throw error;
    }
  },

  createFlashcard: async (flashcardData: CreateFlashcardRequest): Promise<Flashcard> => {
    const response = await apiClient.post(`/api/decks/${flashcardData.deck_id}/flashcards`, flashcardData);
    return response.data;
  },

  updateFlashcard: async (flashcardId: string, flashcardData: Partial<CreateFlashcardRequest>): Promise<Flashcard> => {
    const response = await apiClient.put(`/api/decks/flashcards/${flashcardId}`, flashcardData);
    return response.data;
  },

  deleteFlashcard: async (flashcardId: string): Promise<void> => {
    await apiClient.delete(`/api/decks/flashcards/${flashcardId}`);
  },
};

export default contentService;
