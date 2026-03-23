import { useState, useEffect, useMemo } from 'react';
import { useContentful } from '../hooks/useContentful';
import { useSubstack } from '../hooks/useSubstack';
import { getYouTubeVideo, getInstagramPost } from '../utils/contentful';
import { getLatestYouTubeVideo } from '../utils/youtube';
import { getLatestInstagramPost } from '../utils/instagram';
import Loading from './Loading';
import YouTubeCard from './YouTubeCard';
import SubstackCard from './SubstackCard';
import InstagramCard from './InstagramCard';
import fallbackVideoData from '../dev-data/youtubeVideo.json';
import fallbackPostData from '../dev-data/featuredPost.json';
import fallbackInstagramData from '../dev-data/instagramPost.json';

/**
 * Normalizes various date formats to a comparable Date object
 * @param {string} dateStr - Date string in various formats
 * @returns {Date|null} Parsed Date or null if invalid
 */
const normalizeDate = dateStr => {
  if (!dateStr) return null;

  // Try parsing as ISO 8601 first (YouTube format)
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try parsing RSS format (Substack: "Mon, 06 Jan 2025 11:00:00 GMT")
  // The Date constructor should handle this, but let's be explicit
  const rssMatch = dateStr.match(
    /^(\w{3}),\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}:\d{2}:\d{2})\s*(\w+)?$/
  );
  if (rssMatch) {
    date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

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

  // Get Instagram data from Contentful
  const {
    data: cmsInstagram,
    loading: instagramCmsLoading,
    error: instagramCmsError,
  } = useContentful(getInstagramPost);

  // State for API fallbacks
  const [apiVideo, setApiVideo] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiAttempted, setApiAttempted] = useState(false);

  // State for Instagram API fallback
  const [apiInstagram, setApiInstagram] = useState(null);
  const [instagramApiLoading, setInstagramApiLoading] = useState(false);
  const [instagramApiAttempted, setInstagramApiAttempted] = useState(false);

  // Determine if we need to fetch from YouTube API
  const needsApiFallback =
    !cmsLoading && (cmsError || !cmsVideo || cmsVideo.active === false);

  // Determine if we need to fetch from Instagram API
  const needsInstagramApiFallback =
    !instagramCmsLoading &&
    (instagramCmsError || !cmsInstagram || cmsInstagram.active === false);

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

  // Fetch from Instagram API when Contentful doesn't have an active featured post
  useEffect(() => {
    if (needsInstagramApiFallback && !instagramApiAttempted) {
      setInstagramApiLoading(true);
      setInstagramApiAttempted(true);
      getLatestInstagramPost()
        .then(post => {
          setApiInstagram(post);
        })
        .finally(() => {
          setInstagramApiLoading(false);
        });
    }
  }, [needsInstagramApiFallback, instagramApiAttempted]);

  // Determine final YouTube video data
  const youTubeVideo = useMemo(() => {
    const video =
      cmsVideo && cmsVideo.active !== false
        ? cmsVideo
        : apiVideo || fallbackVideoData;
    return video;
  }, [cmsVideo, apiVideo]);

  // Determine final Substack post data
  const substackData = useMemo(() => {
    return substackPost || (import.meta.env.DEV ? fallbackPostData : null);
  }, [substackPost]);

  // Determine final Instagram post data
  const instagramPost = useMemo(() => {
    const post =
      cmsInstagram && cmsInstagram.active !== false
        ? cmsInstagram
        : apiInstagram || fallbackInstagramData;
    return post;
  }, [cmsInstagram, apiInstagram]);

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
    (cmsLoading ||
      apiLoading ||
      substackLoading ||
      instagramCmsLoading ||
      instagramApiLoading) &&
    contentItems.length === 0;

  if (isLoading) {
    return <Loading />;
  }

  // Don't render anything if no content is available
  if (contentItems.length === 0) {
    return null;
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
    </>
  );
};

export default FeaturedContent;
