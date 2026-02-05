const CACHE_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Parses RSS XML and extracts post data
 * @param {string} xml - RSS XML string
 * @returns {Array} Array of post objects
 */
const parseRSS = xml => {
  const posts = [];

  // Extract all <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    // Extract fields using regex (avoiding XML parser dependency)
    const getField = (content, tag) => {
      const regex = new RegExp(
        `<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([^<]*)<\\/${tag}>`
      );
      const fieldMatch = content.match(regex);
      if (fieldMatch) {
        return (fieldMatch[1] || fieldMatch[2] || '').trim();
      }
      return '';
    };

    // Extract image from content HTML
    const getImage = content => {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
      return imgMatch ? imgMatch[1] : '';
    };

    const content =
      getField(itemContent, 'content:encoded') ||
      getField(itemContent, 'description');

    posts.push({
      title: getField(itemContent, 'title'),
      link: getField(itemContent, 'link'),
      pubDate: getField(itemContent, 'pubDate'),
      description: getField(itemContent, 'description'),
      thumbnail_url: getImage(content),
      // Include raw content if needed
      content: content,
    });
  }

  return posts;
};

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

  // Get environment variable for Substack URL
  const SUBSTACK_URL = process.env.SUBSTACK_URL;

  if (!SUBSTACK_URL) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'SUBSTACK_URL environment variable is not configured',
      }),
    };
  }

  // Normalize URL and construct feed URL
  const baseUrl = SUBSTACK_URL.replace(/\/$/, '').replace(/^https?:\/\//, '');
  const feedUrl = `https://${baseUrl}/feed`;

  try {
    // Fetch RSS feed from Substack
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'DigiCard/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Substack RSS returned ${response.status}: ${response.statusText}`
      );
    }

    const xml = await response.text();
    const posts = parseRSS(xml);

    // Return only the latest post to match existing behavior
    const latestPost = posts.length > 0 ? posts[0] : null;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=3600`,
      },
      body: JSON.stringify({
        data: latestPost ? [latestPost] : [],
        source: 'substack',
        feedUrl: feedUrl,
      }),
    };
  } catch (error) {
    console.error('Error fetching from Substack:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to fetch posts from Substack' }),
    };
  }
};
