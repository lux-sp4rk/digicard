/**
 * Cache configuration
 */
const CACHE_KEY = 'substack_featured_post';
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
    // The function will still work, just without caching
    console.warn('Failed to cache Substack post:', error);
  }
};

/**
 * Fetches the featured post from Substack via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 *
 * @returns {Promise<Object|null>} Post data or null on error
 */
export const getFeaturedPost = async () => {
  // Check cache first
  const cachedPost = getCachedPost();
  if (cachedPost) {
    return cachedPost;
  }

  try {
    const response = await fetch('/.netlify/functions/substack-proxy');

    if (!response.ok) {
      throw new Error('Failed to fetch posts from Substack');
    }

    const { data: posts } = await response.json();
    const featuredPost = posts.length > 0 ? posts[0] : null;

    // Cache the successful response
    if (featuredPost) {
      setCachedPost(featuredPost);
    }

    return featuredPost;
  } catch (error) {
    console.error('Error fetching featured post from Substack:', error);
    return null;
  }
};
