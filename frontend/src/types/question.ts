// types/question.ts

/**
 * Represents the structure of a single node within the rich text content.
 * This can be a paragraph, heading, image, list, etc.
 */
export interface RichTextNode {
  type: string;
  attrs?: { [key: string]: any };
  content?: RichTextNode[];
  marks?: { type: string; attrs?: { [key: string]: any } }[];
  text?: string;
  [key: string]: any;
}

/**
 * Defines the overall structure of the rich text content, which is typically a document
 * containing an array of rich text nodes.
 */
export interface RichTextContent {
  type: 'doc';
  content: RichTextNode[];
}

/**
 * Represents the author of a question, answer, or comment.
 */
export interface Author {
  id: string;
  username: string;
}

/**
 * Represents a tag associated with a question.
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * Represents a comment on an answer.
 */
export interface Comment {
  id: string;
  content: string; // Assuming comments are plain text for simplicity
  createdAt: string;
  author: Author;
}

/**
 * Represents an answer to a question.
 */
export interface Answer {
  id: string;
  content: RichTextContent;
  createdAt: string;
  author: Author;
  comments: Comment[];
  upvoteCount: number;
  downvoteCount: number;
  userInteraction?: 'upvoted' | 'downvoted' | null;
}

/**
 * Represents the main Question entity, including all its details.
 */
export interface Question {
  id: string;
  title: string;
  description: RichTextContent;
  createdAt: string;
  author: Author;
  tags: Tag[];
  answers?: Answer[];      // Included in the single question response
  answerCount?: number;    // Included in the paginated questions list
}

/**
 * Describes the pagination details returned by the API.
 */
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Defines the structure for the API response when fetching a list of questions.
 */
export interface QuestionsApiResponse {
  success: boolean;
  message: string;
  data: {
    questions: Question[];
    pagination: Pagination;
  };
}

/**
 * Defines the structure for the API response when fetching a single question.
 */
export interface QuestionApiResponse {
  success: boolean;
  message: string;
  data: Question;
}