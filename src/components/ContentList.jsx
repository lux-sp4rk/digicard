import React from 'react';
import clsx from 'clsx';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import SectionHeading from './SectionHeading';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import {
  getIconClasses,
  getCtaButtonClasses,
} from './helpers/themeClassHelper';

/**
 * Simple Markdown-to-HTML formatter for basic formatting (bold, italic, bullets).
 * Used when Contentful returns a string instead of Rich Text.
 */
const renderMarkdown = (text, theme = 'catppuccin') => {
  if (!text || typeof text !== 'string') return text;

  // Split by newlines to handle bullet points
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

    // Simple Bullet points: "- " or "* " at start of line
    if (
      processed.trim().startsWith('- ') ||
      processed.trim().startsWith('* ')
    ) {
      const content = processed.trim().substring(2);
      return `<li class="ml-4 list-disc">${content}</li>`;
    }

    return processed;
  });

  // Re-join and wrap lists
  let html = processedLines.join('\n');

  // Wrap groups of <li> in <ul>
  html = html.replace(/(<li.*?>.*?<\/li>\n?)+/g, match => {
    return `<ul class="my-2">${match}</ul>`;
  });

  // Wrap non-list paragraphs in <p> if they aren't already part of something
  html = html
    .split('\n')
    .map(line => {
      if (!line.trim()) return '<br/>';
      const trimmedLine = line.trim();
      if (
        trimmedLine.startsWith('<ul') ||
        trimmedLine.startsWith('<li') ||
        trimmedLine.startsWith('<p') ||
        trimmedLine.startsWith('<a') // Don't wrap our button links in <p> if they are standalone
      )
        return line;
      return `<p class="mb-2">${line}</p>`;
    })
    .join('\n');

  return html;
};

/**
 * Render a description field that may be a Contentful Rich Text document
 * or a plain string (from fallback data).
 */
const ContentDescription = ({ description, className, theme }) => {
  if (!description) return null;

  const textColorClass =
    'text-black/90 dark:text-white/90 matrix:text-matrix-text catppuccin:text-catppuccin-text flexoki:text-flexoki-text';

  if (typeof description === 'object' && description.nodeType) {
    return (
      <div
        className={clsx(
          'text-sm leading-relaxed max-w-none space-y-3',
          textColorClass,
          className
        )}
      >
        {documentToReactComponents(description)}
      </div>
    );
  }

  // Handle plain string (Markdown fallback)
  return (
    <div
      className={clsx(
        'text-sm leading-relaxed max-w-none space-y-3',
        textColorClass,
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(description, theme) }}
    />
  );
};

const ContentList = ({
  fetchFn,
  fallbackData = [],
  sectionTitle,
  ctaHeading,
  ctaButtonText,
  ctaHref,
  theme = 'catppuccin',
}) => {
  const { data: cmsItems, loading, error } = useContentful(fetchFn);

  // If we have an error or if we've finished loading and got nothing, use fallback
  const items =
    cmsItems && cmsItems.length > 0 ? cmsItems : loading ? [] : fallbackData;

  const sortedItems = [...items]
    .filter(i => i.active)
    .sort((a, b) => a.order - b.order);

  if (!loading) {
    if (error) {
      console.warn(
        `[ContentList] Error fetching ${sectionTitle}, using fallback:`,
        error
      );
    } else if (!cmsItems || cmsItems.length === 0) {
      console.info(
        `[ContentList] No published entries for ${sectionTitle} from Contentful, using fallback data.`
      );
    }
  }

  return (
    <section className="p-5">
      <SectionHeading>{sectionTitle}</SectionHeading>

      {loading && (
        <div className="text-center py-8 opacity-60">
          Loading {sectionTitle.toLowerCase()}...
        </div>
      )}

      {!loading && (
        <div className="space-y-1">
          {sortedItems.map((item, index) => (
            <div
              key={item.id || `${sectionTitle.toLowerCase()}-${index}`}
              className={clsx(
                'group relative py-6 px-2',
                index !== sortedItems.length - 1 && 'border-b',
                theme === 'matrix'
                  ? 'border-matrix-glow/20'
                  : 'border-gray-200 dark:border-gray-700',
                index % 2 === 1 && 'md:pl-12'
              )}
            >
              {/* Subtle accent line - always visible */}
              <div
                className={clsx(
                  'absolute left-0 top-6 bottom-6 w-px',
                  theme === 'matrix'
                    ? 'bg-matrix-glow/30'
                    : 'bg-gray-300 dark:bg-gray-600'
                )}
              />

              <div className="flex items-start gap-4 md:gap-6">
                {item.icon && (
                  <div
                    className={clsx(
                      'flex-shrink-0 mt-1 opacity-70',
                      theme === 'matrix' && 'text-matrix-highlight'
                    )}
                  >
                    <DynamicIcon
                      iconName={item.icon}
                      size={24}
                      className={getIconClasses(theme)}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3
                    className={clsx(
                      'text-xl md:text-2xl font-heading font-bold leading-tight mb-2 tracking-tight'
                    )}
                  >
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p
                      className={clsx(
                        'text-sm font-medium tracking-wide uppercase opacity-50 mb-3',
                        theme === 'matrix' && 'text-matrix-rain'
                      )}
                    >
                      {item.subtitle}
                    </p>
                  )}
                  <div className="leading-relaxed">
                    <ContentDescription
                      description={item.description}
                      theme={theme}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {ctaButtonText && ctaHref && (
        <div
          className={clsx(
            'mt-8 p-6 text-center',
            theme === 'matrix'
              ? 'border border-matrix-glow/30'
              : 'border-t border-gray-200 dark:border-gray-700'
          )}
        >
          {ctaHeading && (
            <p
              className={clsx(
                'text-base mb-4 opacity-80',
                theme === 'matrix' && 'text-matrix-highlight'
              )}
            >
              {ctaHeading}
            </p>
          )}
          <a
            href={ctaHref}
            className={clsx(
              'inline-block px-6 py-2.5 rounded font-medium text-sm tracking-wide uppercase transition-colors',
              getCtaButtonClasses(theme)
            )}
          >
            {ctaButtonText}
          </a>
        </div>
      )}
    </section>
  );
};

export default ContentList;
