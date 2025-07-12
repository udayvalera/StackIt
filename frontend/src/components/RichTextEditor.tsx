import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  X,
  Upload,
  Copy,
  Check
} from 'lucide-react';

interface UploadedImage {
  id: string;
  name: string;
  url: string;
  file: File;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your content here...",
  className = ""
}) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      executeCommand('insertHTML', '    ');
      return;
    }
    
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'k':
          e.preventDefault();
          setShowLinkDialog(true);
          break;
      }
    }
  };

  const handleInput = () => {
    updateContent();
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline">${linkText}</a> `;
      
      // Focus the editor first
      if (editorRef.current) {
        editorRef.current.focus();
        
        // Get current selection or place cursor at end
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const linkElement = document.createElement('div');
          linkElement.innerHTML = linkHtml;
          const linkNode = linkElement.firstChild;
          if (linkNode) {
            range.insertNode(linkNode);
            range.setStartAfter(linkNode);
            range.setEndAfter(linkNode);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          // If no selection, append to end
          editorRef.current.innerHTML += linkHtml;
        }
        
        updateContent();
      }
      
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const insertCodeBlock = () => {
    if (codeContent) {
      const codeId = `code-${Date.now()}`;
      const codeHtml = `
        <div class="code-block bg-gray-100 dark:bg-gray-800 rounded-lg my-4 border border-gray-200 dark:border-gray-700" data-code-id="${codeId}">
          <div class="flex items-center justify-between bg-gray-800 text-gray-200 px-4 py-2 rounded-t-lg">
            <span class="text-sm font-mono">${codeLanguage}</span>
            <button 
              onclick="copyCodeToClipboard('${codeId}')" 
              class="copy-btn text-xs bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded transition-colors flex items-center space-x-1"
            >
              <span class="copy-text">Copy</span>
            </button>
          </div>
          <div class="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
            <pre class="font-mono text-sm whitespace-pre-wrap" data-code-content="${btoa(codeContent)}">${codeContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
          </div>
        </div>
      `;
      executeCommand('insertHTML', codeHtml);
      setCodeContent('');
      setShowCodeDialog(false);
    }
  };

  const insertEmoji = (emoji: string) => {
    executeCommand('insertHTML', emoji);
    setShowEmojiPicker(false);
  };

  const insertHeading = (level: number) => {
    executeCommand('formatBlock', `h${level}`);
  };

  const insertQuote = () => {
    executeCommand('formatBlock', 'blockquote');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const newImage: UploadedImage = {
            id: imageId,
            name: file.name,
            url: imageUrl,
            file: file
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          
          // Insert image into editor
          const imgHtml = `<img src="${imageUrl}" alt="${file.name}" class="max-w-full h-auto rounded-lg my-2" data-image-id="${imageId}" />`;
          executeCommand('insertHTML', imgHtml);
        };
        reader.readAsDataURL(file);
      }
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (imageId: string) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
    
    // Remove image from editor
    if (editorRef.current) {
      const imgElement = editorRef.current.querySelector(`[data-image-id="${imageId}"]`);
      if (imgElement) {
        imgElement.remove();
        updateContent();
      }
    }
  };

  // Add global copy function
  React.useEffect(() => {
    (window as any).copyCodeToClipboard = (codeId: string) => {
      const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
      if (codeBlock) {
        const preElement = codeBlock.querySelector('pre[data-code-content]');
        if (preElement) {
          const encodedContent = preElement.getAttribute('data-code-content');
          if (encodedContent) {
            const codeContent = atob(encodedContent);
            navigator.clipboard.writeText(codeContent).then(() => {
              const copyBtn = codeBlock.querySelector('.copy-btn');
              const copyText = codeBlock.querySelector('.copy-text');
              if (copyBtn && copyText) {
                copyText.textContent = 'Copied!';
                copyBtn.classList.add('bg-green-600');
                setTimeout(() => {
                  copyText.textContent = 'Copy';
                  copyBtn.classList.remove('bg-green-600');
                }, 2000);
              }
            });
          }
        }
      }
    };

    return () => {
      delete (window as any).copyCodeToClipboard;
    };
  }, []);

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'strikeThrough', icon: Strikethrough, title: 'Strikethrough' },
  ];

  const formatButtons = [
    { action: () => insertHeading(1), icon: Heading1, title: 'Heading 1' },
    { action: () => insertHeading(2), icon: Heading2, title: 'Heading 2' },
    { action: () => insertHeading(3), icon: Heading3, title: 'Heading 3' },
    { action: insertQuote, icon: Quote, title: 'Quote' },
  ];

  const listButtons = [
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
  ];

  const alignButtons = [
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
  ];

  const commonEmojis = [
    '😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', 
    '💡', '✅', '❌', '⚠️', '📝', '💻', '🚀', '🎯', '💪', '🙏',
    '👋', '👏', '🤝', '💯', '🔴', '🟢', '🔵', '⭐', '📊', '📈'
  ];

  const programmingLanguages = [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
    'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'html', 'css',
    'sql', 'bash', 'json', 'xml', 'yaml', 'markdown'
  ];

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-2 flex items-center space-x-1 flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex items-center space-x-1">
          {toolbarButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => executeCommand(command)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        
        <div className="border-l border-gray-300 dark:border-gray-600 h-6" />
        
        {/* Headings and Quote */}
        <div className="flex items-center space-x-1">
          {formatButtons.map(({ action, icon: Icon, title }, index) => (
            <button
              key={index}
              type="button"
              onClick={action}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="border-l border-gray-300 dark:border-gray-600 h-6" />
        
        {/* Lists */}
        <div className="flex items-center space-x-1">
          {listButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => executeCommand(command)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="border-l border-gray-300 dark:border-gray-600 h-6" />
        
        {/* Alignment */}
        <div className="flex items-center space-x-1">
          {alignButtons.map(({ command, icon: Icon, title }) => (
            <button
              key={command}
              type="button"
              onClick={() => executeCommand(command)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={title}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="border-l border-gray-300 dark:border-gray-600 h-6" />
        
        {/* Media and Code */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShowLinkDialog(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Insert Link (Ctrl+K)"
          >
            <Link className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Upload Image"
          >
            <Image className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowCodeDialog(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Insert Code Block"
          >
            <Code className="h-4 w-4" />
          </button>
        </div>

        <div className="border-l border-gray-300 dark:border-gray-600 h-6" />
        
        {/* Emoji */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            title="Insert Emoji"
          >
            <Smile className="h-4 w-4" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 z-20 w-64">
              <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto">
                {commonEmojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-32 p-4 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white prose prose-sm max-w-none dark:prose-invert"
        style={{ 
          minHeight: '8rem',
          direction: 'ltr',
          textAlign: 'left'
        }}
        data-placeholder={placeholder}
      />

      {/* Uploaded Images Display */}
      {uploadedImages.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Uploaded Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedImages.map((image) => (
              <div key={image.id} className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(image.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => removeImage(image.id)}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-16 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Link Text (what users will see)
                </label>
                <input
                  type="text"
                  placeholder="Click here to visit our website"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL (where the link goes)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkText('');
                  setLinkUrl('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl.trim() || !linkText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Dialog */}
      {showCodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[32rem]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Insert Code Block</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {programmingLanguages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code
              </label>
              <textarea
                placeholder="Paste your code here..."
                value={codeContent}
                onChange={(e) => setCodeContent(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                rows={8}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
            </div>

            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setShowCodeDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertCodeBlock}
                disabled={!codeContent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Code
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        [contenteditable] {
          outline: none;
          direction: ltr !important;
          text-align: left !important;
        }
        
        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        
        .dark [contenteditable]:empty::before {
          color: #6B7280;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          list-style-position: inside;
        }
        
        [contenteditable] ul li {
          list-style-type: disc;
        }
        
        [contenteditable] ol li {
          list-style-type: decimal;
        }
        
        .code-block {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .code-block pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        
        .code-block code {
          background: none;
          padding: 0;
          border-radius: 0;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        blockquote {
          border-left: 4px solid #3B82F6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          background: #F8FAFC;
          padding: 1rem;
          border-radius: 0.5rem;
        }

        .dark blockquote {
          background: #1F2937;
          border-left-color: #60A5FA;
        }

        h1, h2, h3 {
          margin: 1rem 0 0.5rem 0;
          font-weight: bold;
        }

        h1 { font-size: 1.875rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;