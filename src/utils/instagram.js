import { cacheGet, cacheSet } from './cacheUtils';

const CACHE_KEY = 'instagram_latest_post';

/**
 * Fetches the latest post from Instagram via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 * The Netlify function also has server-side caching for additional efficiency.
 *
 * @returns {Promise<Object|null>} Post data matching the Contentful schema, or null on error
 */
export const getLatestInstagramPost = async () => {
  // Check cache first
  const cachedPost = cacheGet(CACHE_KEY);
  if (cachedPost) {
    return cachedPost;
  }

  try {
    const response = await fetch('/.netlify/functions/instagram-latest');
    const contentType = response.headers.get('content-type') || '';

    if (!response.ok || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(
        `Instagram function error: ${response.status} — Content-Type: ${contentType} — Body: ${text.slice(0, 200)}`
      );
      throw new Error(
        `Instagram function error: ${response.status}${contentType.includes('text/html') ? ' (HTML response — function may not be deployed)' : ''}`
      );
    }

    const post = await response.json();

    // Cache the successful response
    if (post) {
      cacheSet(CACHE_KEY, post);
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
