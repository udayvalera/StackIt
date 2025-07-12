import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ThumbsUp, User, Clock, Tag, Archive } from 'lucide-react';
import { formatDistanceToNow } from '../utils/dateUtils';

interface Question {
  _id: string;
  title: string;
  description: { ops: any[] };
  author: {
    _id: string;
    username: string;
  };
  tags: Array<{
    _id: string;
    name: string;
  }>;
  acceptedAnswerId?: string;
  createdAt: string;
  answerCount: number;
  upvoteCount: number;
  isArchived?: boolean;
}

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const getPlainText = (ops: any[]) => {
    return ops
      .map(op => typeof op.insert === 'string' ? op.insert : '')
      .join('')
      .slice(0, 200);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-6 hover:shadow-md transition-shadow ${
      question.isArchived 
        ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {question.isArchived && (
            <div className="flex items-center space-x-2 mb-3">
              <Archive className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Archived</span>
            </div>
          )}
          
          <Link
            to={`/question/${question._id}`}
            className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
          >
            {question.title}
          </Link>
          
          <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
            {getPlainText(question.description.ops)}
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
                  key={tag._id}
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
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{question.upvoteCount || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <ThumbsUp className="h-3 w-3 mr-1" />
              votes
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${question.acceptedAnswerId ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
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