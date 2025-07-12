import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Clock, Tag, ArrowLeft, Archive, UserX, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnswerCard from '../components/AnswerCard';
import RichTextEditor from '../components/RichTextEditor';
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
  isArchived?: boolean;
}

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

// Mock data for testing
const mockQuestions: { [key: string]: Question } = {
  'question-1': {
    _id: 'question-1',
    title: 'How to implement JWT authentication in React?',
    description: { 
      ops: [{ 
        insert: 'I\'m trying to implement JWT authentication in my React application but I\'m having trouble with token storage and refresh logic.\n\nSpecifically, I need help with:\n1. Where to store JWT tokens securely\n2. How to handle token refresh\n3. Best practices for protecting routes\n\nI\'ve tried storing tokens in localStorage but I\'ve heard it\'s not secure. What are the alternatives?' 
      }] 
    },
    author: {
      _id: 'user-001',
      username: 'john_doe'
    },
    tags: [
      { _id: 'tag-1', name: 'React' },
      { _id: 'tag-2', name: 'JWT' },
      { _id: 'tag-3', name: 'Authentication' }
    ],
    acceptedAnswerId: 'answer-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isArchived: false
  }
};

const mockAnswers: { [key: string]: Answer[] } = {
  'question-1': [
    {
      _id: 'answer-1',
      content: { 
        ops: [{ 
          insert: 'Great question! Here\'s a comprehensive approach to JWT authentication in React:\n\n<strong>1. Token Storage</strong>\nFor maximum security, store JWT tokens in httpOnly cookies rather than localStorage. This prevents XSS attacks from accessing your tokens.\n\n<strong>2. Token Refresh</strong>\nImplement automatic token refresh using a refresh token pattern:\n\n```javascript\nconst refreshToken = async () => {\n  const response = await fetch(\'/api/auth/refresh\', {\n    method: \'POST\',\n    credentials: \'include\'\n  });\n  return response.json();\n};\n```\n\n<strong>3. Route Protection</strong>\nUse a higher-order component or custom hook to protect routes:\n\n```javascript\nconst ProtectedRoute = ({ children }) => {\n  const { user, loading } = useAuth();\n  \n  if (loading) return <Spinner />;\n  if (!user) return <Navigate to="/login" />;\n  \n  return children;\n};\n```\n\nThis approach provides both security and good user experience!' 
        }] 
      },
      author: {
        _id: 'admin-001',
        username: 'admin'
      },
      upvotes: ['user-001', 'user-002', 'user-003'],
      downvotes: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      _id: 'answer-2',
      content: { 
        ops: [{ 
          insert: 'I\'d also recommend using a library like <strong>react-query</strong> or <strong>SWR</strong> for handling authentication state and automatic retries.\n\nHere\'s a simple example with react-query:\n\n```javascript\nconst { data: user, isLoading } = useQuery(\'user\', fetchUser, {\n  retry: false,\n  refetchOnWindowFocus: false\n});\n```\n\nThis makes it much easier to manage authentication state across your entire application.' 
        }] 
      },
      author: {
        _id: 'user-002',
        username: 'jane_smith'
      },
      upvotes: ['user-001'],
      downvotes: [],
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
  ]
};

const QuestionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestion();
    }
  }, [id]);

  const fetchQuestion = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (id && mockQuestions[id]) {
      setQuestion(mockQuestions[id]);
      setAnswers(mockAnswers[id] || []);
    }
    
    setLoading(false);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newAnswer: Answer = {
      _id: `answer-${Date.now()}`,
      content: { ops: [{ insert: answerContent }] },
      author: {
        _id: user.id,
        username: user.username
      },
      upvotes: [],
      downvotes: [],
      createdAt: new Date().toISOString()
    };
    
    setAnswers(prev => [...prev, newAnswer]);
    setAnswerContent('');
    setIsSubmitting(false);
  };

  const handleVote = async (answerId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setAnswers(prev => prev.map(answer => {
      if (answer._id === answerId) {
        const upvotes = [...answer.upvotes];
        const downvotes = [...answer.downvotes];
        
        // Remove user from both arrays first
        const upvoteIndex = upvotes.indexOf(user.id);
        const downvoteIndex = downvotes.indexOf(user.id);
        
        if (upvoteIndex > -1) upvotes.splice(upvoteIndex, 1);
        if (downvoteIndex > -1) downvotes.splice(downvoteIndex, 1);
        
        // Add to appropriate array if not already there
        if (voteType === 'upvote' && !upvotes.includes(user.id)) {
          upvotes.push(user.id);
        } else if (voteType === 'downvote' && !downvotes.includes(user.id)) {
          downvotes.push(user.id);
        }
        
        return { ...answer, upvotes, downvotes };
      }
      return answer;
    }));
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question) return;
    
    // Allow both question author and admin to accept answers
    if (question.author._id !== user.id && user.role !== 'Admin') return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setQuestion(prev => prev ? { ...prev, acceptedAnswerId: answerId } : null);
  };

  const handleArchiveQuestion = async () => {
    if (!user || user.role !== 'Admin' || !question) return;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setQuestion(prev => prev ? { ...prev, isArchived: !prev.isArchived } : null);
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
        className="prose prose-lg max-w-none dark:prose-invert [&_.code-block]:not-prose [&_code]:text-sm [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Question not found</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const canAcceptAnswers = user && (question.author._id === user.id || user.role === 'Admin');
  const isAdmin = user && user.role === 'Admin';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Questions</span>
      </Link>

      {/* Question */}
      <div className={`bg-white dark:bg-gray-800 border rounded-lg p-8 mb-8 ${
        question.isArchived 
          ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        {question.isArchived && (
          <div className="flex items-center space-x-2 mb-4">
            <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-orange-600 dark:text-orange-400 font-medium">This question is archived</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{question.title}</h1>
          
          {isAdmin && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleArchiveQuestion}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  question.isArchived
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
                    : 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/30'
                }`}
              >
                {question.isArchived ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Unarchive</span>
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    <span>Archive</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        <div className="prose prose-lg max-w-none mb-6 dark:prose-invert">
          {renderContent(question.description.ops)}
        </div>

        <div className="flex items-center space-x-6 mb-4">
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <User className="h-4 w-4" />
            <span className="font-medium">{question.author.username}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>asked {formatDistanceToNow(new Date(question.createdAt))} ago</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {question.tags.map(tag => (
            <span
              key={tag._id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        <div className="space-y-6">
          {/* Show accepted answer first */}
          {question.acceptedAnswerId && (
            answers
              .filter(answer => answer._id === question.acceptedAnswerId)
              .map(answer => (
                <AnswerCard
                  key={answer._id}
                  answer={answer}
                  isAccepted={true}
                  onVote={handleVote}
                />
              ))
          )}
          
          {/* Show other answers */}
          {answers
            .filter(answer => answer._id !== question.acceptedAnswerId)
            .map(answer => (
              <AnswerCard
                key={answer._id}
                answer={answer}
                canAccept={canAcceptAnswers}
                onVote={handleVote}
                onAccept={handleAcceptAnswer}
              />
            ))}
        </div>
      </div>

      {/* Answer Form */}
      {user && !question.isArchived ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Answer</h3>
          
          <form onSubmit={handleSubmitAnswer}>
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
              className="mb-4"
            />
            
            <button
              type="submit"
              disabled={!answerContent.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Posting...' : 'Post Your Answer'}
            </button>
          </form>
        </div>
      ) : question.isArchived ? (
        <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-700 rounded-lg p-6 text-center">
          <Archive className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
          <p className="text-orange-700 dark:text-orange-300 mb-4">This question is archived and no longer accepts new answers.</p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You must be logged in to post an answer.</p>
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Login to Answer
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;