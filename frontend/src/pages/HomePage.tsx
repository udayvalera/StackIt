import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Archive } from 'lucide-react';
import QuestionCard from '../components/QuestionCard';

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

// Mock questions for testing
const mockQuestions: Question[] = [
  {
    _id: 'question-1',
    title: 'How to implement JWT authentication in React?',
    description: { ops: [{ insert: 'I\'m trying to implement JWT authentication in my React application but I\'m having trouble with token storage and refresh logic. What are the best practices for handling JWT tokens securely in a React app?' }] },
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
    answerCount: 3,
    upvoteCount: 15,
    isArchived: false
  },
  {
    _id: 'question-2',
    title: 'Best practices for MongoDB schema design?',
    description: { ops: [{ insert: 'I\'m designing a MongoDB schema for an e-commerce application. Should I embed product reviews in the product document or keep them in a separate collection? What are the trade-offs?' }] },
    author: {
      _id: 'user-002',
      username: 'jane_smith'
    },
    tags: [
      { _id: 'tag-4', name: 'MongoDB' },
      { _id: 'tag-5', name: 'Database Design' },
      { _id: 'tag-6', name: 'NoSQL' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    answerCount: 2,
    upvoteCount: 8,
    isArchived: false
  },
  {
    _id: 'question-3',
    title: 'How to optimize React component re-renders?',
    description: { ops: [{ insert: 'My React application is experiencing performance issues due to unnecessary re-renders. I\'ve heard about React.memo, useMemo, and useCallback, but I\'m not sure when to use each one. Can someone explain the differences and best practices?' }] },
    author: {
      _id: 'user-003',
      username: 'alex_dev'
    },
    tags: [
      { _id: 'tag-1', name: 'React' },
      { _id: 'tag-7', name: 'Performance' },
      { _id: 'tag-8', name: 'Optimization' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    answerCount: 5,
    upvoteCount: 23,
    isArchived: false
  },
  {
    _id: 'question-4',
    title: 'TypeScript vs JavaScript for large projects?',
    description: { ops: [{ insert: 'Our team is debating whether to migrate our large JavaScript codebase to TypeScript. What are the main benefits and drawbacks? Is it worth the migration effort for an existing project with 100k+ lines of code?' }] },
    author: {
      _id: 'user-004',
      username: 'sarah_tech'
    },
    tags: [
      { _id: 'tag-9', name: 'TypeScript' },
      { _id: 'tag-10', name: 'JavaScript' },
      { _id: 'tag-11', name: 'Migration' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    answerCount: 7,
    upvoteCount: 31,
    isArchived: true
  },
  {
    _id: 'question-5',
    title: 'How to handle file uploads in Node.js?',
    description: { ops: [{ insert: 'I need to implement file upload functionality in my Node.js API. What are the best libraries and practices for handling file uploads securely? Should I store files locally or use cloud storage?' }] },
    author: {
      _id: 'user-005',
      username: 'mike_backend'
    },
    tags: [
      { _id: 'tag-12', name: 'Node.js' },
      { _id: 'tag-13', name: 'File Upload' },
      { _id: 'tag-14', name: 'API' }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    answerCount: 4,
    upvoteCount: 12,
    isArchived: false
  }
];

const HomePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'votes' | 'answers'>('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchQuestions();
  }, [searchQuery, sortBy, showArchived]);

  const fetchQuestions = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredQuestions = [...mockQuestions];
    
    // Filter by archived status
    filteredQuestions = filteredQuestions.filter(q => 
      showArchived ? q.isArchived : !q.isArchived
    );
    
    // Apply search filter
    if (searchQuery) {
      filteredQuestions = filteredQuestions.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.ops.some(op => 
          typeof op.insert === 'string' && 
          op.insert.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        q.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'votes':
        filteredQuestions.sort((a, b) => b.upvoteCount - a.upvoteCount);
        break;
      case 'answers':
        filteredQuestions.sort((a, b) => b.answerCount - a.answerCount);
        break;
      case 'newest':
      default:
        filteredQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    
    setQuestions(filteredQuestions);
    setLoading(false);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'votes', label: 'Most Voted' },
    { value: 'answers', label: 'Most Answered' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : showArchived ? 'Archived Questions' : 'All Questions'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
              showArchived 
                ? 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300' 
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Archive className="h-4 w-4" />
            <span className="text-sm">{showArchived ? 'Show Active' : 'Show Archived'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchQuery ? 'No questions found matching your search.' : showArchived ? 'No archived questions.' : 'No questions yet. Be the first to ask!'}
            </p>
          </div>
        ) : (
          questions.map(question => (
            <QuestionCard key={question._id} question={question} />
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;