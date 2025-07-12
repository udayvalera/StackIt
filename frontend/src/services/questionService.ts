// services/questionService.ts

import apiClient from './api/apiClient';
import {
  QuestionsApiResponse,
  QuestionApiResponse,
} from '../types/question';

/**
 * Defines the parameters that can be sent to the getQuestions endpoint.
 */
interface GetQuestionsParams {
  page?: number;
  pageSize?: number;
  tags?: string; // Comma-separated list of tags
  filter?: 'newest' | 'most_answered' | 'unanswered';
}

/**
 * Fetches a paginated and filtered list of questions from the API.
 * @param params - The query parameters for filtering and pagination.
 * @returns A promise that resolves to the API response for the list of questions.
 */
export const getQuestions = async (
  params: GetQuestionsParams
): Promise<QuestionsApiResponse> => {
  try {
    // The `params` object is automatically serialized into URL query parameters by axios.
    const response = await apiClient.get<QuestionsApiResponse>('/question', {
      params,
    });
    return response.data;
  } catch (error) {
    // You can handle errors more robustly here, e.g., by logging them or re-throwing a custom error.
    console.error('Failed to fetch questions:', error);
    throw new Error('Failed to retrieve questions.');
  }
};

/**
 * Fetches a single question by its unique identifier.
 * @param questionId - The ID of the question to retrieve.
 * @returns A promise that resolves to the API response for the single question.
 */
export const getQuestionById = async (
  questionId: string
): Promise<QuestionApiResponse> => {
  if (!questionId) {
    throw new Error('Question ID is required.');
  }

  try {
    const response = await apiClient.get<QuestionApiResponse>(
      `/question/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch question with ID ${questionId}:`, error);
    throw new Error('Failed to retrieve the question.');
  }
};