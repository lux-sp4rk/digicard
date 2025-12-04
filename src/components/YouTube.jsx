import { useState, useEffect } from 'react';
import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
import { getYouTubeVideo } from '../utils/contentful';
import { getLatestYouTubeVideo } from '../utils/youtube';
import Loading from './Loading';

const YouTube = ({ theme }) => {
  const {
    data: cmsVideo,
    loading: cmsLoading,
    error: cmsError,
  } = useContentful(getYouTubeVideo);
  const [apiVideo, setApiVideo] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);

  // Determine if we need to fetch from YouTube API
  // Fetch if: Contentful failed, returned null, or video is inactive
  const needsApiFallback =
    !cmsLoading && (cmsError || !cmsVideo || cmsVideo.active === false);

  // Fetch from YouTube API when Contentful doesn't have an active featured video
  useEffect(() => {
    if (needsApiFallback && !apiAttempted) {
      setApiLoading(true);
      setApiAttempted(true);
      getLatestYouTubeVideo()
        .then(video => {
          setApiVideo(video);
        })
        .finally(() => {
          setApiLoading(false);
        });
    }
  }, [needsApiFallback, apiAttempted]);

  const loading = cmsLoading || apiLoading;
  // Use Contentful video if available and active, otherwise use API video
  const video = cmsVideo && cmsVideo.active !== false ? cmsVideo : apiVideo;

  const getThumbnailUrl = videoId => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getVideoUrl = videoId => {
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  const getEmbedUrl = videoId => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const extractVideoId = url => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const isYouTubeShort = url => {
    return url.includes('/shorts/');
  };

  const createRipple = e => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  if (loading) return <Loading />;
  if (!video || video.active === false) return null;

  const videoId = extractVideoId(video.url);
  const thumbnailUrl = video.thumbnail || getThumbnailUrl(videoId);
  const videoUrl = getVideoUrl(videoId);
  const embedUrl = getEmbedUrl(videoId);
  const isShort = isYouTubeShort(video.url);

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
        <span className="flex items-center gap-2 p-2">
          <DynamicIcon iconName="FaYoutube" className="text-white" size={32} />
          <h2 className={clsx('section-heading', 'mt-4')}>Youtube</h2>
        </span>
      </div>
      <div className={clsx('mx-auto', isShort ? 'max-w-sm' : 'max-w-2xl')}>
        <div
          className={clsx(
            'rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
            'bg-white dark:bg-dracula-currentLine',
            'web2:bg-web2-cardBg',
            'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
            'flex flex-col'
          )}
        >
          {/* Desktop: Embedded video */}
          <div
            className={clsx(
              'hidden md:block',
              isShort ? 'aspect-[9/16]' : 'aspect-video'
            )}
          >
            <iframe
              src={embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="w-full h-full rounded-t-lg"
            />
          </div>

          {/* Mobile: Thumbnail with play button */}
          <div
            className={clsx(
              'md:hidden relative overflow-hidden group',
              isShort ? 'aspect-[9/16]' : 'aspect-video'
            )}
            onClick={createRipple}
          >
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <DynamicIcon
                  iconName="FaYoutube"
                  className="text-white text-2xl"
                />
              </div>
            </div>
            {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs">
                {video.duration}
              </div>
            )}
          </div>
          <div className="p-6">
            <h3
              className={clsx(
                'text-xl font-semibold mb-3',
                'text-github-text dark:text-dracula-purple',
                'matrix:text-matrix-highlight',
                'web2:text-web2-text'
              )}
            >
              {video.title}
            </h3>
            <p
              className={clsx(
                'text-sm mb-4',
                'text-github-mutedText dark:text-dracula-foreground',
                'matrix:text-matrix-green',
                'web2:text-web2-mutedText'
              )}
            >
              {video.description}
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
                {video.publishDate &&
                  new Date(video.publishDate).toLocaleDateString()}
              </span>

              {/* Show "Watch on YouTube" button only on mobile */}
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'md:hidden inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors',
                  'bg-red-600 text-white hover:bg-red-700',
                  'dark:bg-red-500 dark:hover:bg-red-600',
                  'matrix:bg-matrix-terminal matrix:border matrix:border-matrix-glow matrix:text-matrix-highlight matrix:hover:text-matrix-glow',
                  'web2:bg-web2-accent web2:hover:bg-web2-accentHover',
                  'dark:text-dracula-comment dark:hover:text-dracula-pink'
                )}
              >
                <DynamicIcon iconName="FaYoutube" />
                Watch on YouTube
              </a>

              {/* Desktop: Show link to YouTube for full screen viewing */}
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  'hidden md:inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors',
                  'text-github-mutedText hover:text-github-text',
                  'matrix:text-matrix-green matrix:hover:text-matrix-highlight',
                  'web2:text-web2-mutedText web2:hover:text-web2-text',
                  'dark:text-dracula-foreground dark:hover:text-dracula-pink'
                )}
              >
                <DynamicIcon iconName="FaExternalLinkAlt" />
                Open in YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTube;
