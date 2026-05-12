import { cacheGet, cacheSet } from './cacheUtils';

const CACHE_KEY = 'soundcloud_latest_track';

/**
 * Fetches the latest track from SoundCloud via Netlify function.
 * Implements client-side caching with 24-hour TTL to minimize API calls.
 * The Netlify function also has server-side caching for additional efficiency.
 *
 * @returns {Promise<Object|null>} Track data matching the Contentful schema, or null on error
 */
export const getLatestSoundCloudTrack = async () => {
  // Check cache first
  const cachedTrack = cacheGet(CACHE_KEY);
  if (cachedTrack) {
    return cachedTrack;
  }

  try {
    const response = await fetch('/.netlify/functions/soundcloud-latest');

    if (!response.ok) {
      throw new Error(`SoundCloud function error: ${response.status}`);
    }

    const track = await response.json();

    // Cache the successful response
    if (track) {
      cacheSet(CACHE_KEY, track);
    }

    return track;
  } catch (error) {
    console.error('Error fetching latest SoundCloud track:', error);
    return null;
  }
};