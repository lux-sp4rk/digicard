const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const CACHE_MAX_AGE = 86400; // 24 hours in seconds

/**
 * Converts ISO 8601 duration (PT1H2M3S) to human readable format (1:02:03)
 */
function formatDuration(isoDuration) {
  if (!isoDuration) return null;

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const handler = async event => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'YouTube API key or Channel ID is not configured',
      }),
    };
  }

  try {
    // The uploads playlist ID is the channel ID with 'UC' replaced by 'UU'
    const uploadsPlaylistId = CHANNEL_ID.replace(/^UC/, 'UU');

    // Fetch the latest video from the uploads playlist
    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE}/playlistItems?` +
        new URLSearchParams({
          part: 'snippet',
          playlistId: uploadsPlaylistId,
          maxResults: '1',
          key: API_KEY,
        })
    );

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text();
      throw new Error(
        `YouTube API error: ${playlistResponse.status} - ${errorText}`
      );
    }

    const playlistData = await playlistResponse.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'No videos found in channel' }),
      };
    }

    const latestVideo = playlistData.items[0];
    const videoId = latestVideo.snippet.resourceId.videoId;

    // Fetch video details to get duration
    let duration = null;
    const videoResponse = await fetch(
      `${YOUTUBE_API_BASE}/videos?` +
        new URLSearchParams({
          part: 'contentDetails',
          id: videoId,
          key: API_KEY,
        })
    );

    if (videoResponse.ok) {
      const videoData = await videoResponse.json();
      if (videoData.items && videoData.items.length > 0) {
        duration = formatDuration(videoData.items[0].contentDetails.duration);
      }
    }

    // Return data in the same format as Contentful
    const video = {
      id: videoId,
      title: latestVideo.snippet.title,
      description: latestVideo.snippet.description,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail:
        latestVideo.snippet.thumbnails?.maxres?.url ||
        latestVideo.snippet.thumbnails?.high?.url ||
        latestVideo.snippet.thumbnails?.medium?.url ||
        '',
      duration,
      publishDate: latestVideo.snippet.publishedAt,
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
      body: JSON.stringify(video),
    };
  } catch (error) {
    console.error('Error fetching from YouTube:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch latest video from YouTube',
      }),
    };
  }
};
