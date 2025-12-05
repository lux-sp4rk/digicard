/**
 * Fetches the latest video from YouTube via Netlify function.
 * The function caches responses for 24 hours to minimize API quota usage.
 *
 * @returns {Promise<Object|null>} Video data matching the Contentful schema, or null on error
 */
export const getLatestYouTubeVideo = async () => {
  try {
    const response = await fetch('/.netlify/functions/youtube-latest');

    if (!response.ok) {
      throw new Error(`YouTube function error: ${response.status}`);
    }

    const video = await response.json();
    return video;
  } catch (error) {
    console.error('Error fetching latest YouTube video:', error);
    return null;
  }
};
