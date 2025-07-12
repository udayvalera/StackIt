// utils/richTextParser.ts

import { RichTextContent, RichTextNode } from '../types/question';

// --- Function for QuestionCard Previews ---

const parseNodeToPlainText = (node: RichTextNode): string => {
  let text = '';
  if (node.text) {
    text += node.text;
  }
  if (node.content) {
    text += node.content.map(parseNodeToPlainText).join(' ');
  }
  return text;
};

/**
 * Converts rich text content into a plain text string for previews.
 * EXPORTED for use in QuestionCard.tsx
 */
export const generatePlainText = (description?: RichTextContent): string => {
  if (!description || !description.content) {
    return '';
  }
  return description.content.map(parseNodeToPlainText).join('\n');
};


// --- Functions for Full QuestionPage Rendering ---

const nodeTagMap: { [key: string]: string } = {
  paragraph: 'p',
  heading: 'h',
  bulletList: 'ul',
  orderedList: 'ol',
  listItem: 'li',
  blockquote: 'blockquote',
  codeBlock: 'pre',
};

const markTagMap: { [key: string]: string } = {
  bold: 'strong',
  italic: 'em',
  strike: 's',
  underline: 'u',
  code: 'code',
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const generateHtmlFromNode = (node: RichTextNode): string => {
  if (node.text) {
    let textContent = escapeHtml(node.text);
    if (node.marks) {
      node.marks.forEach(mark => {
        if (mark.type === 'link') {
          const { href, target } = mark.attrs || {};
          textContent = `<a href="${href}" target="${target}" rel="noopener noreferrer">${textContent}</a>`;
        } else {
          const tag = markTagMap[mark.type];
          if (tag) {
            textContent = `<${tag}>${textContent}</${tag}>`;
          }
        }
      });
    }
    return textContent;
  }

  const childrenHtml = node.content ? node.content.map(generateHtmlFromNode).join('') : '';

  if (node.type === 'image' && node.attrs?.src) {
    const { src, alt } = node.attrs;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" />`;
  }

  const tag = nodeTagMap[node.type];
  if (tag) {
    if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      return `<h${level}>${childrenHtml}</h${level}>`;
    }
    if (node.type === 'codeBlock') {
      return `<pre><code>${childrenHtml}</code></pre>`;
    }
    const textAlign = node.attrs?.textAlign;
    const style = textAlign ? `style="text-align: ${textAlign}"` : '';
    return `<${tag} ${style}>${childrenHtml}</${tag}>`;
  }

  return childrenHtml;
};

/**
 * Converts rich text content into a full HTML string for detailed display.
 * EXPORTED for use in QuestionPage.tsx
 */
export const generateHTML = (description?: RichTextContent): string => {
  if (!description || !description.content) {
    return '';
  }
  return description.content.map(generateHtmlFromNode).join('');
};