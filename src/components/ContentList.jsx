import React from 'react';
import clsx from 'clsx';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import SectionHeading from './SectionHeading';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import {
  getCardClasses,
  getIconClasses,
  getCtaBorderClasses,
  getCtaButtonClasses,
} from './helpers/themeClassHelper';

/**
 * Render a description field that may be a Contentful Rich Text document
 * or a plain string (from fallback data).
 */
const ContentDescription = ({ description, className }) => {
  if (!description) return null;

  if (typeof description === 'object' && description.nodeType) {
    return (
      <div
        className={clsx(
          'opacity-90 prose prose-sm max-w-none dark:prose-invert catppuccin:prose-invert',
          className
        )}
      >
        {documentToReactComponents(description)}
      </div>
    );
  }

  return (
    <p className={clsx('text-base leading-relaxed opacity-90', className)}>
      {description}
    </p>
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

  if (error) {
    console.warn(
      `Contentful error for ${sectionTitle}, using fallback data:`,
      error
    );
  }

  return (
    <section className={clsx('p-5 animate-fade-in')}>
      <SectionHeading>{sectionTitle}</SectionHeading>

      {loading && (
        <div className="text-center py-8 opacity-60">
          Loading {sectionTitle.toLowerCase()}...
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 grid-cols-1">
          {sortedItems.map((item, index) => (
            <div
              key={item.id || `${sectionTitle.toLowerCase()}-${index}`}
              className={clsx(
                'p-6 rounded-lg border transition-all duration-300',
                'hover:scale-[1.01]',
                getCardClasses(theme)
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {item.icon && (
                  <DynamicIcon
                    iconName={item.icon}
                    size={24}
                    className={getIconClasses(theme)}
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p
                      className={clsx(
                        'text-sm font-medium opacity-80',
                        theme === 'matrix' && 'text-matrix-rain'
                      )}
                    >
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <ContentDescription description={item.description} />
            </div>
          ))}
        </div>
      )}

      {ctaButtonText && ctaHref && (
        <div
          className={clsx(
            'mt-8 p-6 rounded-xl text-center border-2 border-dashed',
            getCtaBorderClasses(theme)
          )}
        >
          {ctaHeading && <p className="text-lg font-bold mb-2">{ctaHeading}</p>}
          <a
            href={ctaHref}
            className={clsx(
              'inline-block px-6 py-2 rounded-full font-bold transition-transform hover:scale-105',
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
