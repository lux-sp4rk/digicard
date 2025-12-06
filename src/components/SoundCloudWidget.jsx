import { useState, useEffect } from 'react';
import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import { getSoundCloudTrack } from '../utils/contentful';
import Loading from './Loading';

const SoundCloudWidget = ({ theme }) => {
  const {
    data: cmsTrack,
    loading: trackLoading,
    error: trackError,
  } = useContentful(getSoundCloudTrack);
  const [fallbackTrack, setFallbackTrack] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  // Fallback to JSON file if Contentful fails
  useEffect(() => {
    if (trackError) {
      const abortController = new AbortController();

      fetch('/soundcloudTrack.json', { signal: abortController.signal })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load SoundCloud track');
          return res.json();
        })
        .then(data => {
          setFallbackTrack(data);
          setFallbackLoading(false);
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            setFallbackLoading(false);
          }
        });

      return () => {
        abortController.abort();
      };
    }
  }, [trackError]);

  const loading = trackLoading || (trackError && fallbackLoading);
  const track = cmsTrack || fallbackTrack;

  if (loading) return <Loading />;
  if (!track || track.active === false) return null;

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(track.url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;

  return (
    <section
      className={clsx(
        'p-5',
        theme !== 'web2' && 'border-t border-github-lightGray',
        'dark:border-dracula-currentLine',
        'matrix:border-matrix-glow',
        'matrix:shadow-lg',
        'christmas:border-christmas-gold'
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <DynamicIcon
          iconName="FaSoundcloud"
          className="text-orange-500 text-2xl"
        />
        <h2 className={clsx('section-heading')}>Soundcloud</h2>
      </div>
      <div className="mx-auto max-w-2xl">
        <div
          className={clsx(
            'rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
            'bg-white dark:bg-dracula-currentLine',
            'web2:bg-web2-cardBg',
            'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
            'christmas:bg-christmas-white christmas:border-2 christmas:border-christmas-red',
            'flex flex-col'
          )}
        >
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            className="w-full rounded-t-lg"
          ></iframe>
          <div className="p-6">
            <h3
              className={clsx(
                'text-xl font-semibold mb-3',
                'text-github-text dark:text-dracula-purple',
                'matrix:text-matrix-highlight',
                'web2:text-web2-text',
                'christmas:text-christmas-red'
              )}
            >
              {track.title}
            </h3>
            <p
              className={clsx(
                'text-sm mb-4',
                'text-github-mutedText dark:text-dracula-foreground',
                'matrix:text-matrix-green',
                'web2:text-web2-mutedText',
                'christmas:text-christmas-green-dark'
              )}
            >
              {track.description}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  'text-xs',
                  'text-github-mutedText dark:text-dracula-comment',
                  'matrix:text-matrix-green',
                  'web2:text-web2-mutedText'
                )}
              >
                {track.publishDate &&
                  new Date(track.publishDate).toLocaleDateString()}
              </span>
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors',
                  'text-github-mutedText hover:text-github-text',
                  'matrix:text-matrix-green matrix:hover:text-matrix-highlight',
                  'web2:text-web2-mutedText web2:hover:text-web2-text',
                  'dark:text-dracula-foreground dark:hover:text-dracula-pink'
                )}
              >
                <DynamicIcon iconName="FaExternalLinkAlt" />
                Listen on SoundCloud
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SoundCloudWidget;
