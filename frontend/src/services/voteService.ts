import apiClient from './api/apiClient';
import { VotePayload, VoteType } from '../types/vote';

/**
 * A service object for handling vote-related API calls.
 */
export const voteService = {
  /**
   * Casts a vote (upvote or downvote) on a specific answer.
   *
   * @param answerId - The unique identifier of the answer to vote on.
   * @param voteType - The type of vote to cast ('upvote' or 'downvote').
   * @returns A promise that resolves with the response from the API.
   */
  castVote: (answerId: string, voteType: VoteType) => {
    const payload: VotePayload = { voteType };
    return apiClient.post(`/answer/${answerId}/vote`, payload);
  },
};

export default voteService;