// types/answer.ts

/**
 * Represents a single content node within the answer,
 * which can be a text node or potentially other types in the future.
 */
export interface ContentNode {
  type: 'text';
  text: string;
}

/**
 * Represents the main content block of an answer,
 * typically a paragraph containing multiple content nodes.
 */
export interface Content {
  type: 'paragraph';
  content: ContentNode[];
}

/**
 * Defines the structure for a new answer payload to be sent to the API.
 */
export interface NewAnswer {
  content: Content;
}

/**
 * Represents a full answer object as it might be returned from the API,
 * including its ID and other metadata.
 */
export interface Answer extends NewAnswer {
  id: string;
  questionId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}
