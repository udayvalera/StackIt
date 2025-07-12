// pages/HomePage.tsx

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';

// Import services and types
import { getQuestions } from '../services/questionService';
import { Question, Pagination } from '../types/question';
import { generatePlainText } from '../utils/richTextParser';

// Import components
import QuestionCard from '../components/QuestionCard';

const HomePage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Adjusted sortBy to match backend capabilities
  const [sortBy, setSortBy] = useState<'newest' | 'most_answered'>('newest');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data from the service using the current sort filter
        const response = await getQuestions({
          page: 1, // Note: Add state for current page for full pagination
          pageSize: 20,
          filter: sortBy,
        });

        let fetchedQuestions = response.data.questions;
        setPagination(response.data.pagination);

        // Client-side search filtering (as backend doesn't support a general search query)
        if (searchQuery) {
          fetchedQuestions = fetchedQuestions.filter(q => {
            const plainTextDescription = generatePlainText(q.description);
            return (
              q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              plainTextDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
            );
          });
        }
        
        setQuestions(fetchedQuestions);
      } catch (err) {
        setError('Failed to load questions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchQuery, sortBy]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'most_answered', label: 'Most Answered' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 dark:text-red-400 text-lg">{error}</p>
            </div>
        )
    }

    if (questions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery ? 'No questions found matching your search.' : 'No questions have been asked yet.'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {questions.map(question => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Questions'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {pagination ? `${pagination.total} question${pagination.total !== 1 ? 's' : ''} found` : ''}
          </p>
        </div>

        <div className="flex items-center space-x-4">
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
      {renderContent()}
    </div>
  );
};

export default HomePage;