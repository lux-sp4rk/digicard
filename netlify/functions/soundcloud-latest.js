const SOUNDCLOUD_API_BASE = 'https://soundcloud.com';
const SOUNDCLOUD_OEMBED_URL = 'https://soundcloud.com/oembed';
const CACHE_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Scrapes a SoundCloud profile page to find the latest track URL.
 * @param {string} profileUrl - The SoundCloud profile URL
 * @returns {Promise<string|null>} The track URL or null if not found
 */
async function getLatestTrackUrl(profileUrl) {
  const response = await fetch(profileUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Digicard/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  const html = await response.text();

  // SoundCloud embeds track data in a JSON variable
  // Look for the first track URL in the page
  // Pattern: "https://soundcloud.com/user/track-name"
  const trackMatch = html.match(/https:\/\/soundcloud\.com\/[^\s"'<>]+\/[^\s"'<>]+/g);

  if (trackMatch) {
    // Filter for likely track URLs (not full pages, not sets)
    const trackUrls = trackMatch.filter(
      url => !url.includes('/sets/') && !url.includes('/pages/')
    );
    if (trackUrls.length > 0) {
      return trackUrls[0];
    }
  }

  return null;
}

/**
 * Gets track metadata via oEmbed.
 * @param {string} trackUrl - The SoundCloud track URL
 * @returns {Promise<Object>} Track metadata
 */
async function getTrackMetadata(trackUrl) {
  const response = await fetch(
    `${SOUNDCLOUD_OEMBED_URL}?url=${encodeURIComponent(trackUrl)}&format=json`
  );

  if (!response.ok) {
    throw new Error(`oEmbed error: ${response.status}`);
  }

  return response.json();
}

export const handler = async event => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const USER_URL = process.env.SOUNDCLOUD_USER_URL;

  if (!USER_URL) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'SoundCloud user URL is not configured',
      }),
    };
  }

  try {
    // First, scrape the profile to find the latest track URL
    const trackUrl = await getLatestTrackUrl(USER_URL);

    if (!trackUrl) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'No tracks found on SoundCloud profile' }),
      };
    }

    // Get track metadata via oEmbed
    const oembedData = await getTrackMetadata(trackUrl);

    // Extract track ID from URL
    const urlParts = trackUrl.split('/');
    const trackId = urlParts[urlParts.length - 1] || oembedData.title;

    // Return data in the same format as Contentful
    const track = {
      id: trackId,
      title: oembedData.title,
      url: oembedData.url || trackUrl,
      thumbnail: oembedData.thumbnail_url || null,
      publishDate: new Date().toISOString(),
      active: true,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=3600`,
      },
      body: JSON.stringify(track),
    };
  } catch (error) {
    console.error('Error fetching from SoundCloud:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to fetch latest track from SoundCloud',
      }),
    };
  }
};