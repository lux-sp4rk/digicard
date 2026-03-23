/**
 * Cache configuration
 */
const CACHE_KEY = 'instagram_latest_post';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Cache structure: { data: Object, timestamp: number }
 */

/**
 * Gets cached post data from localStorage
 * @returns {Object|null} Cached post data or null if expired/missing
 */
const getCachedPost = () => {
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
 * Stores post data in cache with current timestamp
 * @param {Object} postData - Post data to cache
 */
const setCachedPost = postData => {
  try {
    const cacheEntry = {
      data: postData,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheEntry));
  } catch (error) {
    // If localStorage is full or unavailable, silently fail
    console.warn('Failed to cache Instagram post:', error);
  }
};

/**
 * Fetches the latest post from Instagram via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 * The Netlify function also has server-side caching for additional efficiency.
 *
 * @returns {Promise<Object|null>} Post data matching the Contentful schema, or null on error
 */
export const getLatestInstagramPost = async () => {
  // Check cache first
  const cachedPost = getCachedPost();
  if (cachedPost) {
    return cachedPost;
  }

  try {
    const response = await fetch('/.netlify/functions/instagram-latest');

    if (!response.ok) {
      throw new Error(`Instagram function error: ${response.status}`);
    }

    const post = await response.json();

    // Cache the successful response
    if (post) {
      setCachedPost(post);
    }

    return post;
  } catch (error) {
    console.error('Error fetching latest Instagram post:', error);
    return null;
  }
};

/**
 * Truncates caption to specified length with ellipsis
 * @param {string} caption - Full caption text
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated caption
 */
export const truncateCaption = (caption, maxLength = 120) => {
  if (!caption || caption.length <= maxLength) return caption;
  return caption.substring(0, maxLength).trim() + '...';
};
