import React from 'react';
import clsx from 'clsx';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import { renderMarkdown } from '../utils/stringUtils';

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: node => {
      const asset = node?.data?.target;
      if (!asset || !asset.fields || !asset.fields.file) return null;

      const { file } = asset.fields;
      if (!file.contentType || !file.contentType.startsWith('image/'))
        return null;

      const url = file.url
        ? file.url.startsWith('//')
          ? `https:${file.url}`
          : file.url.startsWith('http')
            ? file.url
            : `https://${file.url}`
        : '';
      if (!url) return null;

      const alt =
        asset.fields.description || asset.fields.title || file.fileName || '';

      return (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="max-w-full h-auto rounded-lg my-4"
          onError={e => {
            e.target.style.display = 'none';
            console.warn(`Failed to load embedded image: ${url}`);
          }}
        />
      );
    },
  },
};

const RichTextRenderer = ({ description, className, theme }) => {
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
        {documentToReactComponents(description, richTextOptions)}
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

export default RichTextRenderer;
