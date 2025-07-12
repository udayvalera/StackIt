import React, { useState } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import { AIService } from '../services/aiService';

interface AIResponse {
  title: string;
  answer: string;
}

interface AIAssistPanelProps {
  isOpen: boolean;
  onClose: () => void;
  questionTitle: string;
}

const AIAssistPanel: React.FC<AIAssistPanelProps> = ({
  isOpen,
  onClose,
  questionTitle
}) => {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeQuestion = async () => {
    if (!questionTitle.trim()) {
      setError('Please enter a question title first');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await AIService.analyzeQuestion(questionTitle);
      setAiResponse(response);
    } catch (err) {
      setError('Failed to analyze question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && questionTitle.trim()) {
      analyzeQuestion();
    }
  }, [isOpen, questionTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Get AI-powered suggestions to improve your question
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            <button
              onClick={analyzeQuestion}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Analyzing your question...</span>
            </div>
          </div>
        )}

        {aiResponse && !isLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">{aiResponse.title}</h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-line">
              {aiResponse.answer}
            </div>
          </div>
        )}

        {!isLoading && !aiResponse && !error && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Enter a question title and I'll help you improve it!
            </p>
            <button
              onClick={analyzeQuestion}
              disabled={!questionTitle.trim()}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Analyze Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistPanel;