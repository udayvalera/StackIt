import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/dateUtils';

interface Answer {
  _id: string;
  content: { ops: any[] };
  author: {
    _id: string;
    username: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

interface AnswerCardProps {
  answer: Answer;
  isAccepted?: boolean;
  canAccept?: boolean;
  onVote: (answerId: string, voteType: 'upvote' | 'downvote') => Promise<void>;
  onAccept?: (answerId: string) => Promise<void>;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  isAccepted = false,
  canAccept = false,
  onVote,
  onAccept
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

  const userVote = user ? (
    answer.upvotes.includes(user.id) ? 'upvote' :
    answer.downvotes.includes(user.id) ? 'downvote' : null
  ) : null;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote(answer._id, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const renderContent = (ops: any[]) => {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: ops.map(op => {
            if (typeof op.insert === 'string') {
              // Enhanced content rendering with better formatting
              return op.insert
                .replace(/\n/g, '<br>')
                .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>');
            }
            return '';
          }).join('')
        }}
        className="prose prose-sm max-w-none dark:prose-invert [&_.code-block]:not-prose [&_code]:text-sm [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono"
      />
    );
  };

  const voteScore = answer.upvotes.length - answer.downvotes.length;

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-6 ${isAccepted ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
      {isAccepted && (
        <div className="flex items-center space-x-2 mb-4">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400 font-medium">Accepted Answer</span>
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Vote Controls */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => handleVote('upvote')}
            disabled={!user || isVoting}
            className={`p-2 rounded-full transition-colors ${
              userVote === 'upvote'
                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsUp className="h-5 w-5" />
          </button>
          
          <span className="text-lg font-bold text-gray-900 dark:text-white">{voteScore}</span>
          
          <button
            onClick={() => handleVote('downvote')}
            disabled={!user || isVoting}
            className={`p-2 rounded-full transition-colors ${
              userVote === 'downvote'
                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsDown className="h-5 w-5" />
          </button>

          {canAccept && !isAccepted && (
            <button
              onClick={() => onAccept?.(answer._id)}
              className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Accept this answer"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {renderContent(answer.content.ops)}
          </div>

          <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">{answer.author.username}</span>
            </div>
            
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                answered {formatDistanceToNow(new Date(answer.createdAt))} ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;