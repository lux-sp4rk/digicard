import { useMemo } from 'react';
import { useApiData } from '../hooks/useApiData';
import { useContentful } from '../hooks/useContentful';
import { useSubstack } from '../hooks/useSubstack';
import { getYouTubeVideo } from '../utils/contentful';
import { getLatestYouTubeVideo } from '../utils/youtube';
import { getLatestInstagramPost } from '../utils/instagram';
import { normalizeDate } from '../utils/dateUtils';
import Loading from './Loading';
import YouTubeCard from './YouTubeCard';
import SubstackCard from './SubstackCard';
import InstagramCard from './InstagramCard';
import SoundCloudWidget from './SoundCloudWidget';
import fallbackVideoData from '../dev-data/youtubeVideo.json';
import fallbackPostData from '../dev-data/featuredPost.json';
import fallbackInstagramData from '../dev-data/instagramPost.json';

/**
 * FeaturedContent component
 * Fetches YouTube and Substack content, sorts by recency, renders in order
 */
const FeaturedContent = ({ theme }) => {
  // Get YouTube data from Contentful
  const {
    data: cmsVideo,
    loading: cmsLoading,
    error: cmsError,
  } = useContentful(getYouTubeVideo);

  // Get Substack data
  const { post: substackPost, loading: substackLoading } = useSubstack();

  // Determine if we need to fetch from YouTube API
  const needsApiFallback =
    !cmsLoading && (cmsError || !cmsVideo || cmsVideo.active === false);

  // Determine if we need to fetch from Instagram API (always attempt — no Contentful layer)
  const needsInstagramApiFallback = true;

  // YouTube API fallback (used when Contentful has no active video)
  const { data: apiVideo, loading: apiLoading } = useApiData(
    getLatestYouTubeVideo,
    needsApiFallback
  );

  // Instagram API fallback
  const { data: apiInstagram, loading: instagramApiLoading } = useApiData(
    getLatestInstagramPost,
    needsInstagramApiFallback
  );

  // Determine final YouTube video data
  const youTubeVideo = useMemo(() => {
    // Don't use fallback while still loading
    if (cmsLoading || apiLoading) {
      return cmsVideo || apiVideo || null;
    }
    const video =
      !cmsLoading && (cmsError || !cmsVideo || cmsVideo.active === false)
        ? apiVideo || fallbackVideoData
        : cmsVideo || fallbackVideoData;
    return video;
  }, [cmsVideo, apiVideo, cmsLoading, apiLoading, cmsError]);

  // Determine final Substack post data
  const substackData = useMemo(() => {
    // Don't use fallback while still loading
    if (substackLoading) {
      return substackPost || null;
    }
    return substackPost || (import.meta.env.DEV ? fallbackPostData : null);
  }, [substackPost, substackLoading]);

  // Determine final Instagram post data
  const instagramPost = useMemo(() => {
    // Don't use fallback while still loading
    if (instagramApiLoading) {
      return apiInstagram || null;
    }
    return apiInstagram || fallbackInstagramData;
  }, [apiInstagram, instagramApiLoading]);

  // Create content items array with normalized dates
  const contentItems = useMemo(() => {
    const items = [];

    // Add YouTube item if available
    if (youTubeVideo && youTubeVideo.active !== false) {
      const publishDate = normalizeDate(youTubeVideo.publishDate);
      if (publishDate) {
        items.push({
          type: 'youtube',
          data: youTubeVideo,
          publishDate,
          id: youTubeVideo.id || 'youtube-fallback',
        });
      }
    }

    // Add Substack item if available
    if (substackData) {
      // Substack uses pubDate from RSS
      const pubDate = substackData.pubDate || substackData.publishDate;
      const publishDate = normalizeDate(pubDate);
      if (publishDate) {
        items.push({
          type: 'substack',
          data: substackData,
          publishDate,
          id: substackData.link || 'substack-fallback',
        });
      }
    }

    // Add Instagram item if available
    if (instagramPost && instagramPost.active !== false) {
      const publishDate = normalizeDate(instagramPost.publishDate);
      if (publishDate) {
        items.push({
          type: 'instagram',
          data: instagramPost,
          publishDate,
          id: instagramPost.id || 'instagram-fallback',
        });
      }
    }

    // Sort by publish date, newest first
    return items.sort((a, b) => b.publishDate - a.publishDate);
  }, [youTubeVideo, substackData, instagramPost]);

  // Determine loading state
  const isLoading =
    (cmsLoading || apiLoading || substackLoading || instagramApiLoading) &&
    contentItems.length === 0;

  if (isLoading) {
    return <Loading />;
  }

  // Don't render anything if no content is available
  if (contentItems.length === 0) {
    return <SoundCloudWidget theme={theme} />;
  }

  return (
    <>
      {contentItems.map(item => {
        if (item.type === 'youtube') {
          return <YouTubeCard key={item.id} video={item.data} theme={theme} />;
        }
        if (item.type === 'substack') {
          return <SubstackCard key={item.id} post={item.data} theme={theme} />;
        }
        if (item.type === 'instagram') {
          return <InstagramCard key={item.id} post={item.data} theme={theme} />;
        }
        return null;
      })}
      {/* SoundCloud renders its own data fetching — placed after sorted media items */}
      <SoundCloudWidget theme={theme} />
    </>
  );
};

export default FeaturedContent;
