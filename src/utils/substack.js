import { cacheGet, cacheSet } from './cacheUtils';

const CACHE_KEY = 'substack_featured_post';

/**
 * Fetches the featured post from Substack via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 *
 * @returns {Promise<Object|null>} Post data or null on error
 */
export const getFeaturedPost = async () => {
  // Check cache first
  const cachedPost = cacheGet(CACHE_KEY);
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
      cacheSet(CACHE_KEY, featuredPost);
    }

    return featuredPost;
  } catch (error) {
    console.error('Error fetching featured post from Substack:', error);
    return null;
  }
};
