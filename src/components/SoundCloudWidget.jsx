import { useState, useEffect } from 'react';
import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import { getSoundCloudTrack } from '../utils/contentful';
import { getLatestSoundCloudTrack } from '../utils/soundcloud';
import Loading from './Loading';

const SoundCloudWidget = ({ theme }) => {
  const {
    data: cmsTrack,
    loading: trackLoading,
    error: trackError,
  } = useContentful(getSoundCloudTrack);
  const [apiTrack, setApiTrack] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [fallbackTrack, setFallbackTrack] = useState(null);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  // Try Netlify function first (new primary source)
  useEffect(() => {
    const abortController = new AbortController();

    getLatestSoundCloudTrack()
      .then(track => {
        if (track) {
          setApiTrack(track);
        }
        setApiLoading(false);
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          console.error('Error fetching from SoundCloud API:', error);
          setApiLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, []);

  // Fall back to JSON file if both API and Contentful fail
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

  const loading = apiLoading || trackLoading || (trackError && fallbackLoading);
  const track = apiTrack || cmsTrack || fallbackTrack;

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
        'matrix:shadow-lg'
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
        </div>
      </div>
    </section>
  );
};

export default SoundCloudWidget;