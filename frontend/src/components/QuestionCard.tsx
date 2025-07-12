// components/QuestionCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, User, Clock, Tag } from 'lucide-react';
// import { formatDistanceToNow } from '../utils/dateUtils'; // Assuming you have this utility

// Import types and utils
import { Question } from '../types/question';
import { generatePlainText } from '../utils/richTextParser';

// A simple date utility if you don't have one
const formatDistanceToNow = (date: Date): string => {
    // This is a placeholder. Use a library like `date-fns` for a robust implementation.
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " seconds";
}


interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  // Use the new parser to get a text preview of the description.
  const descriptionPreview = generatePlainText(question.description).slice(0, 200);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/question/${question.id}`}
            className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {descriptionPreview}...
          </p>

          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{question.author.username}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {formatDistanceToNow(new Date(question.createdAt))} ago
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              {question.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-6 flex flex-col items-center space-y-4">
          <div className="text-center">
            {/* The `answerCount` is available directly from the questions list API */}
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {question.answerCount || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              answers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;