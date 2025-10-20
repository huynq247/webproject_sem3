import { apiClient } from './api';

export interface SingleFlashcardRequest {
  word_or_topic: string;
  language: string;
  card_type: string;
  difficulty: string;
  include_pronunciation: boolean;
  include_examples: boolean;
  include_synonyms: boolean;
}

export interface SingleFlashcardResponse {
  question: string;
  answer: string;
  pronunciation?: string;
  examples: string[];
  synonyms: string[];
  explanation: string;
  difficulty: string;
  tags: string[];
}

export interface FlashcardGenerationRequest {
  topic: string;
  quantity: number;
  language: string;
  deck_name: string;
  deck_description?: string;
}

export interface FlashcardGenerationResponse {
  message: string;
  deck_id: string;
  flashcards_count: number;
  deck: {
    id: string;
    title: string;  // Backend uses 'title' not 'name'
    description: string;
  };
}

export class AIService {
  private static readonly BASE_URL = 'http://localhost:8002/api/v1/ai';

  /**
   * Tạo một flashcard chi tiết bằng AI
   */
  static async generateSingleFlashcard(request: SingleFlashcardRequest): Promise<SingleFlashcardResponse> {
    const response = await apiClient.post(`${this.BASE_URL}/generate-single-flashcard`, request);
    return response.data;
  }

  /**
   * Tạo nhiều flashcards và deck bằng AI
   */
  static async generateFlashcards(request: FlashcardGenerationRequest): Promise<FlashcardGenerationResponse> {
    const response = await apiClient.post(`${this.BASE_URL}/generate-flashcards`, request);
    return response.data;
  }

  /**
   * Tạo mô tả cho deck bằng AI
   */
  static async generateDeckDescription(deckName: string): Promise<{ description: string }> {
    const response = await apiClient.post(`${this.BASE_URL}/generate-deck-description`, {}, {
      params: { deck_name: deckName }
    });
    return response.data;
  }
}
