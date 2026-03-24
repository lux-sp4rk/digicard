const RAPIDAPI_BASE = 'https://instagram120.p.rapidapi.com';
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
    // Fetch user posts from RapidAPI
    const response = await fetch(`${RAPIDAPI_BASE}/api/instagram/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
      },
      body: JSON.stringify({ username: INSTAGRAM_USERNAME, maxId: '' }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`RapidAPI error ${response.status}:`, errorText);
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET',
        },
        body: JSON.stringify({
          error: `RapidAPI error: ${response.status}`,
          details: errorText,
        }),
      };
    }

    const data = await response.json();
    console.log('Instagram API raw response:', JSON.stringify(data));

    // Extract posts from result.edges[].node structure
    const result = data.result || data;
    const edges = result.edges || result.items || [];
    const posts = edges.map(e => e.node || e);

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

    const latestPost = Array.isArray(posts) ? posts[0] : posts;

    // Normalize the response to match Contentful schema
    const post = {
      id: latestPost?.id || latestPost?.pk || latestPost?.code || 'unknown',
      caption:
        latestPost?.caption?.text ||
        latestPost?.caption ||
        latestPost?.text ||
        '',
      imageUrl:
        latestPost?.thumbnail_url ||
        latestPost?.image_versions2?.candidates?.[0]?.url ||
        latestPost?.media_url ||
        latestPost?.display_url ||
        '',
      permalink:
        latestPost?.permalink ||
        latestPost?.url ||
        (latestPost?.code ? `https://instagram.com/p/${latestPost.code}/` : ''),
      publishDate: latestPost?.timestamp
        ? new Date(latestPost.timestamp * 1000).toISOString()
        : latestPost?.taken_at
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify({
        error: 'Failed to fetch latest post from Instagram',
        details: error.message,
      }),
    };
  }
};
