import React from 'react';
import clsx from 'clsx';
import SectionHeading from './SectionHeading';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import RichTextRenderer from './RichTextRenderer';
import {
  getIconClasses,
  getCtaButtonClasses,
} from './helpers/themeClassHelper';

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
              <div className="flex items-start gap-4 md:gap-6">
                {/* Image/icon rendering — theme-aware layout */}
                {theme === 'web2' && item.image ? (
                  /* Web2: small thumbnail on the side */
                  <div className="flex-shrink-0 mt-1 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : item.icon ? (
                  /* Non-web2 themes: icon */
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
                ) : null}
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
                  {/* Catppuccin / Flexoki: large full-width image */}
                  {(theme === 'catppuccin' || theme === 'flexoki') &&
                    item.image && (
                      <div className="mb-4 rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  <div className="leading-relaxed">
                    <RichTextRenderer
                      description={item.description}
                      theme={theme}
                    />
                  </div>
                  {item.url && (
                    <div className="mt-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={clsx(
                          'inline-flex items-center gap-2 text-sm font-medium tracking-wide transition-colors',
                          theme === 'web2'
                            ? 'btn-web2'
                            : 'text-blue-600 hover:text-blue-500'
                        )}
                      >
                        <span>Learn more</span>
                        <span>→</span>
                      </a>
                    </div>
                  )}
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
