import clsx from 'clsx';
import { getCtaButtonClasses } from '../components/helpers/themeClassHelper';

/**
 * Simple Markdown-to-HTML formatter for basic formatting (bold, italic, bullets).
 * Used when Contentful returns a string instead of Rich Text.
 * @param {string} text - Markdown-formatted text
 * @param {string} theme - Current theme for styling
 * @returns {string} - HTML string
 */
export const renderMarkdown = (text, theme = 'catppuccin') => {
  if (!text || typeof text !== 'string') return text;

  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    let processed = line;

    // Bold: **text** or __text__
    processed = processed.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Italic: *text* or _text_
    processed = processed.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Links: [text](url) -> styled as buttons
    const btnClasses = clsx(
      'inline-block px-4 py-1.5 rounded-full text-sm font-bold my-2 no-underline',
      getCtaButtonClasses(theme)
    );
    processed = processed.replace(
      /\[(.*?)\]\((.*?)\)/g,
      `<a href="$2" target="_blank" rel="noopener noreferrer" class="${btnClasses}">$1</a>`
    );

    // Bullet points: "- " or "* " at start of line
    if (
      processed.trim().startsWith('- ') ||
      processed.trim().startsWith('* ')
    ) {
      const content = processed.trim().substring(2);
      return `<li class="ml-4 list-disc">${content}</li>`;
    }

    return processed;
  });

  let html = processedLines.join('\n');

  // Wrap groups of <li> in <ul>
  html = html.replace(/(<li.*?>.*?<\/li>\n?)+/g, match => {
    return `<ul class="my-2">${match}</ul>`;
  });

  // Wrap lines in <p> unless already tagged
  html = html
    .split('\n')
    .map(line => {
      if (!line.trim()) return '<br/>';
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith('<ul') ||
        trimmedLine.startsWith('<li') ||
        trimmedLine.startsWith('<p') ||
        trimmedLine.startsWith('<a')
      ) {
        return line;
      }
      return `<p class="mb-2">${line}</p>`;
    })
    .join('\n');

  return html;
};
