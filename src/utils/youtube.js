/**
 * Cache configuration
 */
const CACHE_KEY = 'youtube_latest_video';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Cache structure: { data: Object, timestamp: number }
 */

/**
 * Gets cached video data from localStorage
 * @returns {Object|null} Cached video data or null if expired/missing
 */
const getCachedVideo = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - timestamp < CACHE_TTL) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    // If there's an error reading cache, clear it and return null
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

/**
 * Stores video data in cache with current timestamp
 * @param {Object} videoData - Video data to cache
 */
const setCachedVideo = videoData => {
  try {
    const cacheEntry = {
      data: videoData,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (error) {
    // If localStorage is full or unavailable, silently fail
    // The function will still work, just without caching
    console.warn('Failed to cache YouTube video:', error);
  }
};

/**
 * Fetches the latest video from YouTube via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 * The Netlify function also has server-side caching for additional efficiency.
 *
 * @returns {Promise<Object|null>} Video data matching the Contentful schema, or null on error
 */
export const getLatestYouTubeVideo = async () => {
  // Check cache first
  const cachedVideo = getCachedVideo();
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
      setCachedVideo(video);
    }

    return video;
  } catch (error) {
    console.error('Error fetching latest YouTube video:', error);
    return null;
  }
};
