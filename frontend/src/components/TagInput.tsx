import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';

interface TagOption {
  _id: string;
  name: string;
}

interface TagInputProps {
  selectedTags: TagOption[];
  onTagsChange: (tags: TagOption[]) => void;
  availableTags?: TagOption[];
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ 
  selectedTags, 
  onTagsChange, 
  availableTags = [],
  className = '' 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState<TagOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue) {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.some(selected => selected._id === tag._id)
      );
      setFilteredTags(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, selectedTags]);

  const addTag = (tag: TagOption) => {
    if (!selectedTags.some(selected => selected._id === tag._id) && selectedTags.length < 5) {
      onTagsChange([...selectedTags, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(tag => tag._id !== tagId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Create new tag if not found in suggestions
      if (filteredTags.length === 0 && selectedTags.length < 5) {
        const newTag: TagOption = {
          _id: `temp-${Date.now()}`,
          name: inputValue.trim()
        };
        addTag(newTag);
      } else if (filteredTags.length > 0) {
        addTag(filteredTags[0]);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg min-h-12 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white dark:bg-gray-700">
        {selectedTags.map(tag => (
          <span
            key={tag._id}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag._id)}
              className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          placeholder={selectedTags.length === 0 ? "Add tags..." : selectedTags.length >= 5 ? "Maximum 5 tags" : ""}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={selectedTags.length >= 5}
          className="flex-1 min-w-20 outline-none placeholder-gray-400 dark:placeholder-gray-500 disabled:cursor-not-allowed bg-transparent text-gray-900 dark:text-white"
          style={{ direction: 'ltr', textAlign: 'left' }}
        />
      </div>

      {showSuggestions && filteredTags.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
          {filteredTags.slice(0, 10).map(tag => (
            <button
              key={tag._id}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <Tag className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-900 dark:text-white">{tag.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;