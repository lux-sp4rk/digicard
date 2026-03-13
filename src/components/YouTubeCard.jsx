import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';

/**
 * YouTubeCard component
 * Renders a single YouTube video card
 */
const YouTubeCard = ({ video, theme }) => {
  const getThumbnailUrl = videoId => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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

  if (!video || video.active === false) return null;

  const videoId = extractVideoId(video.url);
  const thumbnailUrl = video.thumbnail || getThumbnailUrl(videoId);
  const embedUrl = getEmbedUrl(videoId);
  const isShort = isYouTubeShort(video.url);

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
      <div className={clsx('mx-auto', isShort ? 'max-w-sm' : 'max-w-2xl')}>
        <div
          className={clsx(
            'rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
            'bg-white dark:bg-dracula-currentLine',
            'web2:bg-web2-cardBg',
            'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:hover:shadow-matrix-glow',
            'xmas:bg-xmas-cardBg xmas:border-xmas-gold xmas:border-2 xmas:shadow-lg xmas:hover:shadow-xmas-glow',
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
          <button
            className={clsx(
              'md:hidden relative overflow-hidden group w-full text-left',
              isShort ? 'aspect-[9/16]' : 'aspect-video'
            )}
            onClick={createRipple}
            type="button"
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
          </button>
        </div>
      </div>
    </section>
  );
};

export default YouTubeCard;
