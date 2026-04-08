import { cacheGet, cacheSet } from './cacheUtils';

const CACHE_KEY = 'youtube_latest_video';

/**
 * Fetches the latest video from YouTube via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 * The Netlify function also has server-side caching for additional efficiency.
 *
 * @returns {Promise<Object|null>} Video data matching the Contentful schema, or null on error
 */
export const getLatestYouTubeVideo = async () => {
  // Check cache first
  const cachedVideo = cacheGet(CACHE_KEY);
  if (cachedVideo) {
    return cachedVideo;
  }

  try {
    const response = await fetch('/.netlify/functions/youtube-latest');

    if (!response.ok) {
      throw new Error(`YouTube function error: ${response.status}`);
    }

    const video = await response.json();

    // Cache the successful response
    if (video) {
      cacheSet(CACHE_KEY, video);
    }

    return video;
  } catch (error) {
    console.error('Error fetching latest YouTube video:', error);
    return null;
  }
};
