const RAPIDAPI_BASE = 'https://instagram-scraper-api2.p.rapidapi.com';
const CACHE_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Netlify function to fetch latest Instagram post via RapidAPI
 * Mirrors the pattern used in youtube-latest.js
 */
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

  const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME || 'lux_sp4rk';

  if (!RAPIDAPI_KEY) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'RapidAPI key is not configured',
      }),
    };
  }

  try {
    // Fetch user feed from RapidAPI
    const response = await fetch(
      `${RAPIDAPI_BASE}/user-feed?username=${encodeURIComponent(INSTAGRAM_USERNAME)}`,
      {
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RapidAPI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Extract the latest post from the response
    // Note: Response structure depends on the specific RapidAPI endpoint used
    const posts = data.data?.items || data.data || [];

    if (!posts || posts.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'No posts found for user' }),
      };
    }

    const latestPost = posts[0];

    // Normalize the response to match Contentful schema
    const post = {
      id: latestPost.id || latestPost.pk || 'unknown',
      caption: latestPost.caption?.text || latestPost.caption || '',
      imageUrl:
        latestPost.image_versions?.items?.[0]?.url ||
        latestPost.media_url ||
        latestPost.thumbnail_url ||
        '',
      permalink: `https://instagram.com/p/${latestPost.code || latestPost.shortcode}/`,
      publishDate: latestPost.taken_at
        ? new Date(latestPost.taken_at * 1000).toISOString()
        : new Date().toISOString(),
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
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error fetching from Instagram:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to fetch latest post from Instagram',
      }),
    };
  }
};
