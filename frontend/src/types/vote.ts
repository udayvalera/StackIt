/**
 * Represents the possible types of a vote.
 * Can be either 'upvote' or 'downvote'.
 */
export type VoteType = 'upvote' | 'downvote';

/**
 * Defines the structure for the payload when casting a vote.
 */
export interface VotePayload {
  voteType: VoteType;
}
