import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import { getSettings } from '../utils/contentful';
import Loading from './Loading';

/**
 * SubstackCard component
 * Renders a single Substack post card
 */
const SubstackCard = ({ post, theme }) => {
  const { data: settings, loading: settingsLoading } =
    useContentful(getSettings);

  if (settingsLoading) return <Loading />;

  if (!post) return null;

  // Support both RSS format (pubDate) and normalized format (publishDate)
  const postData = {
    ...post,
    link: post.link || post.web_url,
    thumbnail_url: post.thumbnail_url || post.image,
    description: post.description || post.preview_text,
  };

  if (theme === 'web2') {
    return (
      <ClassicSubstackCard post={postData} theme={theme} settings={settings} />
    );
  }

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
        'xmas:bg-white'
      )}
    >
      <div
        className={clsx(
          'bg-white dark:bg-dracula-currentLine',
          'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
          'web2:bg-web2-cardBg web2:border-web2-border',
          'xmas:bg-xmas-cardBg xmas:border-xmas-gold xmas:border-2 xmas:shadow-lg xmas:hover:shadow-xmas-glow',
          'catppuccin:bg-catppuccin-surface catppuccin:border-catppuccin-surface',
          'flexoki:bg-flexoki-surface flexoki:border-flexoki-surface',
          'rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all',
          'border dark:border-dracula-purple matrix:border-matrix-glow web2:border-web2-border xmas:border-xmas-gold dark:hover:border-bg-dracula-currentLine'
        )}
      >
        <a
          href={postData.link}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx('block no-underline text-inherit')}
        >
          <div className={clsx('aspect-video overflow-hidden')}>
            <img
              src={postData.thumbnail_url}
              alt="Featured post thumbnail"
              className={clsx(
                'w-full h-full object-cover transition-transform duration-500 hover:scale-105'
              )}
            />
          </div>
          <div className={clsx('p-4')}>
            <h3 className={clsx('text-lg font-semibold mb-2')}>
              {postData.title}
            </h3>
            <p className={clsx('mb-4')}>{postData.description}</p>
            <span
              className={clsx(
                'inline-flex items-center gap-2 text-matrix-green font-medium'
              )}
            >
              Read More
              <DynamicIcon iconName="FaArrowRight" />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
};

const ClassicSubstackCard = ({ post, theme, settings }) => {
  if (!post) return null;

  const { blogArchiveUrl } = settings || {};

  return (
    <section
      className={clsx(
        'p-6',
        'bg-web2-background',
        theme !== 'web2' && 'border-t border-web2-border',
        'rounded-xl',
        'mb-6'
      )}
    >
      <div
        className={clsx(
          'flex flex-row items-start gap-6',
          'bg-white/70 rounded-lg'
        )}
      >
        <img
          src={post.thumbnail_url}
          alt="Featured post thumbnail"
          className={clsx(
            'w-32 h-32 object-cover rounded shadow-sm',
            'border border-web2-border',
            'mt-2 mb-2'
          )}
          style={{ float: 'left' }}
        />
        <div className="flex-1">
          <a
            href={post.link}
            className={clsx(
              'inline-flex items-center gap-2 underline hover:text-web2-primary transition-colors text-base',
              'web2:hover:text-web2-accent'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3
              className={clsx(
                'text-xl',
                'web2:text-web2-primary',
                'web2:hover:text-web2-accent',
                'mb-1'
              )}
            >
              {post.title}
            </h3>
          </a>
          <p className={clsx('text-web2-text', 'mb-2')}>{post.description}</p>
        </div>
      </div>
      {blogArchiveUrl && (
        <a
          href={`https://${blogArchiveUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'mt-4 block',
            'underline',
            'web2:text-web2-primary',
            'hover:text-blue-800',
            'transition-colors',
            'text-base',
            'font-normal',
            'web2:hover:text-web2-accent'
          )}
        >
          View Archives
        </a>
      )}
    </section>
  );
};

export default SubstackCard;
