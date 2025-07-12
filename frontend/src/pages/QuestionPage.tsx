import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Clock, Tag, ArrowLeft, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

// --- Real Imports (assuming these files exist in your project) ---
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import { generateHTML, parseEditorContent } from '../utils/richTextParser'; // Assuming a parser exists
import { getQuestionById } from '../services/questionService';
import { postAnswer } from '../services/answerService'; // Import the new service
import { voteService } from '../services/voteService';
import { Question, Answer } from '../types/question';
import { NewAnswer, Content } from '../types/answer'; // Import the new types
import RichTextEditor from '../components/RichTextEditor'; // Assuming this component exists

// ==================================================================================
// AnswerCard Component
// ==================================================================================
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
  onAccept,
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);

  const userVote = answer.userInteraction;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return;

    // Prevent multiple clicks while the vote is being processed
    setIsVoting(true);
    try {
      await onVote(answer.id, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const voteScore = answer.upvoteCount - answer.downvoteCount;

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-6 ${
      isAccepted
        ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10'
        : 'border-gray-200 dark:border-gray-700'
    }`}>
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
              userVote === 'upvoted'
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
              userVote === 'downvoted'
                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <ThumbsDown className="h-5 w-5" />
          </button>

          {canAccept && !isAccepted && onAccept && (
            <button
              onClick={() => onAccept(answer.id)}
              className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Accept this answer"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div
            className="prose max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: generateHTML(answer.content) }}
          />
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


// ==================================================================================
// QuestionPage Component (with service integration)
// ==================================================================================
const QuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // The RichTextEditor will manage a JSON object or a string that can be parsed into one.
  const [answerContent, setAnswerContent] = useState<Content | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the question data when the component mounts or the ID changes.
  useEffect(() => {
    if (id) {
      const fetchQuestion = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await getQuestionById(id);
          setQuestion(response.data);
        } catch (err) {
          setError('Question not found or failed to load.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchQuestion();
    }
  }, [id]);

  /**
   * Handles voting on an answer by calling the vote service and
   * optimistically updating the UI for a smooth user experience.
   */
  const handleVote = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    if (!question) return;

    // Optimistically update the state before the API call completes
    setQuestion(prevQuestion => {
      if (!prevQuestion) return null;

      const updatedAnswers = prevQuestion.answers.map(answer => {
        if (answer.id === answerId) {
          const originalVote = answer.userInteraction;
          let newUpvoteCount = answer.upvoteCount;
          let newDownvoteCount = answer.downvoteCount;
          let newUserInteraction: Answer['userInteraction'] = voteType === 'upvote' ? 'upvoted' : 'downvoted';

          // If user clicks the same vote button again, we assume it's to remove the vote
          if (originalVote === newUserInteraction) {
            newUserInteraction = null;
          }
          
          // Adjust counts based on the new and old vote status
          if (originalVote === 'upvoted') newUpvoteCount--;
          if (originalVote === 'downvoted') newDownvoteCount--;
          
          if (newUserInteraction === 'upvoted') newUpvoteCount++;
          if (newUserInteraction === 'downvoted') newDownvoteCount++;

          return { ...answer, upvoteCount: newUpvoteCount, downvoteCount: newDownvoteCount, userInteraction: newUserInteraction };
        }
        return answer;
      });

      return { ...prevQuestion, answers: updatedAnswers };
    });

    try {
      // Call the actual service
      await voteService.castVote(answerId, voteType);
      // On success, the optimistic update is kept.
    } catch (err) {
      console.error("Failed to cast vote:", err);
      setError("Your vote could not be saved. Please try again.");
      // Re-fetch data to ensure consistency after a failed vote
      if (id) {
        const response = await getQuestionById(id);
        setQuestion(response.data);
      }
    }
  };

  /**
   * Handles the submission of a new answer.
   */
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure content exists, user is logged in, not already submitting, and question is loaded.
    if (!answerContent || !user || isSubmitting || !question || !id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // The RichTextEditor should provide the content in the correct format.
      const payload: NewAnswer = {
        content: answerContent,
      };
      
      const newAnswer = await postAnswer(id, payload);

      // Update the question state with the new answer from the server
      setQuestion(prev => prev ? { ...prev, answers: [...(prev.answers || []), newAnswer] } : null);
      
      // Reset the editor
      setAnswerContent(null);

    } catch (err) {
      console.error("Failed to submit answer:", err);
      setError("Your answer could not be posted. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 text-lg">{error || 'Question not found.'}</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }
  
  const acceptedAnswerId = question.acceptedAnswerId || null; 
  const canAcceptAnswers = user && (question.author.id === user.id || user.role === 'Admin');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Link to="/" className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Questions</span>
      </Link>

      {/* Question Details */}
      <div className="bg-white dark:bg-gray-800 border rounded-lg p-8 mb-8 border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1 mb-6">{question.title}</h1>
        
        <div
          className="prose prose-lg max-w-none mb-6 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: generateHTML(question.description) }}
        />

        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span className="font-medium">{question.author.username}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>asked on {new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {question.tags.map(tag => (
            <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
              <Tag className="h-3 w-3 mr-1" />
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {question.answers?.length || 0} Answer{question.answers?.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {question.answers?.map(answer => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              isAccepted={acceptedAnswerId === answer.id}
              canAccept={!!(canAcceptAnswers && acceptedAnswerId !== answer.id)}
              onVote={handleVote}
              // onAccept would be passed here if implemented
            />
          ))}
        </div>
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Answer</h3>
          <form onSubmit={handleSubmitAnswer}>
            {/* The RichTextEditor's onChange should return a Content object or null */}
            <RichTextEditor value={answerContent} onChange={setAnswerContent} placeholder="Write your answer here..." className="mb-4" />
            <button type="submit" disabled={!answerContent || isSubmitting} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? 'Posting...' : 'Post Your Answer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You must be logged in to post an answer.</p>
          <Link to="/login" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
            Login to Answer
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
