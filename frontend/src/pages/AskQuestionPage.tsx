import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import AIAssistPanel from '../components/AIAssistPanel';

interface TagOption {
  _id: string;
  name: string;
}

// Mock tags for testing
const mockTags: TagOption[] = [
  { _id: 'tag-1', name: 'React' },
  { _id: 'tag-2', name: 'JWT' },
  { _id: 'tag-3', name: 'Authentication' },
  { _id: 'tag-4', name: 'MongoDB' },
  { _id: 'tag-5', name: 'Database Design' },
  { _id: 'tag-6', name: 'NoSQL' },
  { _id: 'tag-7', name: 'Performance' },
  { _id: 'tag-8', name: 'Optimization' },
  { _id: 'tag-9', name: 'TypeScript' },
  { _id: 'tag-10', name: 'JavaScript' },
  { _id: 'tag-11', name: 'Migration' },
  { _id: 'tag-12', name: 'Node.js' },
  { _id: 'tag-13', name: 'File Upload' },
  { _id: 'tag-14', name: 'API' }
];

const AskQuestionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAIAssist, setShowAIAssist] = useState(false);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12" dir="ltr">
        <p className="text-gray-600 dark:text-gray-400 mb-4">You must be logged in to ask a question.</p>
        <Link
          to="/login"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Login to Ask Question
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!title.trim() || !description.trim() || selectedTags.length === 0) {
      setError('Please fill in all fields and add at least one tag.');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, just navigate to the first question
    navigate('/question/question-1');
  };

  const handleAITagSuggestion = (suggestedTags: string[]) => {
    const newTags: TagOption[] = suggestedTags.map(tagName => {
      // Check if tag already exists in mockTags
      const existingTag = mockTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
      if (existingTag) {
        return existingTag;
      }
      // Create new tag
      return {
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: tagName
      };
    });
    
    // Add only tags that aren't already selected
    const tagsToAdd = newTags.filter(newTag => 
      !selectedTags.some(selected => selected.name.toLowerCase() === newTag.name.toLowerCase())
    );
    
    setSelectedTags(prev => [...prev, ...tagsToAdd].slice(0, 5)); // Limit to 5 tags
  };

  const handleAITitleSuggestion = (suggestedTitle: string) => {
    setTitle(suggestedTitle);
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Questions</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Ask a Question</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help from the community by asking a clear, detailed question.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300" style={{ textAlign: 'left' }}>
                Question Title *
              </label>
              <button
                type="button"
                onClick={() => setShowAIAssist(true)}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assist</span>
              </button>
            </div>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Be specific and imagine you're asking a question to another person"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              style={{ direction: 'ltr', textAlign: 'left' }}
              maxLength={200}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ textAlign: 'left' }}>
              Question Details * 
              <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                (Supports rich text, code blocks, and emojis)
              </span>
            </label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Provide all the details someone would need to answer your question...&#10;&#10;💡 Tips:&#10;• Use code blocks for code examples&#10;• Add emojis to make your question more engaging&#10;• Use headings to organize your content&#10;• Include error messages and what you've tried"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Use the rich text editor to format your question with code blocks, headings, lists, and more. 
              This helps others understand your problem better! 🚀
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" style={{ textAlign: 'left' }}>
              Tags *
            </label>
            <TagInput
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={mockTags}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Add up to 5 tags to categorize your question. Start typing to see suggestions.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By posting, you agree to be respectful and helpful to the community.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Assist Panel */}
      <AIAssistPanel
        isOpen={showAIAssist}
        onClose={() => setShowAIAssist(false)}
        questionTitle={title}
      />
    </div>
  );
};

export default AskQuestionPage;