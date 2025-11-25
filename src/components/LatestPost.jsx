import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import SectionHeading from './SectionHeading';

import Loading from './Loading';
import { useBeeHiiv } from '../hooks/useBeeHiiv';
import { useContentful } from '../hooks/useContentful';
import { getSettings } from '../utils/contentful';
import fallbackPostData from '../featuredPost.json';

const LatestPost = ({ theme }) => {
  const { post, loading } = useBeeHiiv();
  const { data: settings, loading: settingsLoading } =
    useContentful(getSettings);

  if (settingsLoading) return <Loading />;
  const { blogArchiveUrl } = settings || {};

  const sectionClassName = clsx(
    'p-5',
    theme !== 'web2' && 'border-t border-github-lightGray',
    'dark:border-dracula-currentLine',
    'matrix:border-matrix-glow',
    'matrix:shadow-lg'
  );

  if (loading && !post) return <Loading />;

  return (
    <section className={sectionClassName}>
      <SectionHeading>Latest Post</SectionHeading>
      <Post
        post={post || fallbackPostData}
        theme={theme}
        blogArchiveUrl={blogArchiveUrl}
      />
    </section>
  );
};

const Post = ({ post, theme, blogArchiveUrl }) => {
  if (theme === 'web2' || theme === 'csszen') {
    return (
      <ClassicFeaturedPost
        featuredPost={post}
        theme={theme}
        blogArchiveUrl={blogArchiveUrl}
      />
    );
  }
  return (
    <div
      className={clsx(
        'bg-white dark:bg-dracula-currentLine',
        'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
        'web2:bg-web2-cardBg web2:border-web2-border',
        'rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all',
        'border dark:border-dracula-purple matrix:border-matrix-glow web2:border-web2-border dark:hover:border-bg-dracula-currentLine'
      )}
    >
      <a
        href={post.link || post.web_url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx('block no-underline text-inherit')}
      >
        <div className={clsx('aspect-video overflow-hidden')}>
          <img
            src={post.thumbnail_url || post.image}
            alt="Featured post thumbnail"
            className={clsx(
              'w-full h-full object-cover transition-transform duration-500 hover:scale-105'
            )}
          />
        </div>
        <div className={clsx('p-4')}>
          <h3 className={clsx('text-lg font-semibold mb-2')}>{post.title}</h3>
          <p className={clsx('mb-4')}>
            {post.description || post.preview_text}
          </p>
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
  );
};

const ClassicFeaturedPost = ({ featuredPost, theme, blogArchiveUrl }) => {
  if (!featuredPost) return null;
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
          src={featuredPost.thumbnail_url || featuredPost.image}
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
            href={featuredPost.link || featuredPost.web_url}
            className={clsx(
              'inline-flex items-center gap-2 underline hover:text-web2-primary transition-colors text-base',
              'web2:hover:text-web2-accent',
              'csszen:hover:text-[#8b7c4a]'
              // 'font-bold'
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3
              className={clsx(
                'text-xl',
                'web2:text-web2-primary csszen:text-csszen-text',
                'web2:hover:text-web2-accent',
                'mb-1'
              )}
            >
              {featuredPost.title}
            </h3>
          </a>
          <p className={clsx('text-web2-text', 'mb-2')}>
            {featuredPost.description || featuredPost.preview_text}
          </p>
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
            'web2:text-web2-primary csszen:text-csszen-text',
            'hover:text-blue-800 csszen:hover:text-[#8b7c4a]',
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

export default LatestPost;
