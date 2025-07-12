// services/answerService.ts

import apiClient from './api/apiClient';
import { Answer, NewAnswer } from '../types/answer';

/**
 * Posts a new answer for a specific question.
 *
 * @param questionId - The unique identifier of the question being answered.
 * @param answerData - The content of the answer, conforming to the NewAnswer interface.
 * @returns A promise that resolves to the newly created answer data.
 * @throws Will throw an error if the API request fails.
 */
export const postAnswer = async (
  questionId: string,
  answerData: NewAnswer
): Promise<Answer> => {
  try {
    // Make a POST request to the '/answer/{questionId}/new' endpoint
    const response = await apiClient.post<Answer>(
      `/answer/${questionId}/new`,
      answerData
    );

    // Return the data from the response
    return response.data;
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error posting new answer:', error);

    // Re-throw the error to be handled by the calling function
    throw error;
  }
};
