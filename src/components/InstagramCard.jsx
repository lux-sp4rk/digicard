import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { truncateCaption } from '../utils/instagram';

/**
 * InstagramCard component
 * Displays a single Instagram post in a card format
 * Used by FeaturedContent component
 */
const InstagramCard = ({ post, theme }) => {
  if (!post || post.active === false) return null;

  const displayCaption = truncateCaption(post.caption || post.title, 150);

  return (
    <section
      className={clsx(
        'p-5',
        theme !== 'web2' && 'border-t border-github-lightGray',
        'dark:border-dracula-currentLine',
        'matrix:border-matrix-glow',
        'matrix:shadow-lg',
        'xmas:border-xmas-gold',
        'xmas:shadow-lg',
        'xmas:bg-xmas-red'
      )}
    >
      <div className="mx-auto max-w-md">
        <div
          className={clsx(
            'rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
            'bg-white dark:bg-dracula-currentLine',
            'web2:bg-web2-cardBg',
            'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
            'xmas:bg-xmas-cardBg xmas:border-xmas-gold xmas:border-2 xmas:shadow-lg xmas:hover:shadow-xmas-glow',
            'catppuccin:bg-catppuccin-surface catppuccin:border catppuccin:border-catppuccin-overlay',
            'flexoki:bg-flexoki-surface flexoki:border flexoki:border-flexoki-muted',
            'flex flex-col'
          )}
        >
          {/* Image container - square aspect ratio for Instagram */}
          <a
            href={post.permalink || post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block aspect-square overflow-hidden group"
          >
            <img
              src={post.imageUrl || post.thumbnail || '/featured-post.png'}
              alt={displayCaption || 'Instagram post'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Instagram icon overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white rounded-full p-3">
                <DynamicIcon
                  iconName="FaInstagram"
                  className="text-pink-600 text-xl"
                />
              </div>
            </div>
          </a>

          {/* Caption and link */}
          <div className="p-4">
            <p
              className={clsx(
                'text-sm mb-3 line-clamp-2',
                'text-github-dark dark:text-dracula-foreground',
                'web2:text-web2-text',
                'matrix:text-matrix-text',
                'xmas:text-xmas-white'
              )}
            >
              {displayCaption}
            </p>
            <a
              href={
                post.permalink ||
                post.url ||
                `https://instagram.com/${import.meta.env.VITE_INSTAGRAM_USERNAME || 'lux_sp4rk'}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(
                'inline-flex items-center gap-2 text-sm font-medium transition-colors',
                'text-pink-600 hover:text-pink-700',
                'dark:text-pink-400 dark:hover:text-pink-300',
                'matrix:text-matrix-highlight matrix:hover:text-matrix-accent',
                'xmas:text-xmas-gold xmas:hover:text-xmas-white'
              )}
            >
              <DynamicIcon iconName="FaInstagram" />
              <span>View on Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramCard;
