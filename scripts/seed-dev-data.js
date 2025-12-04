#!/usr/bin/env node

/**
 * Seed script for dev fallback data
 * Fetches the latest Beehiiv post and YouTube video directly from APIs
 * and saves them as JSON files for use as fallback data in development.
 *
 * Usage: npm run seed:dev-data
 *
 * Requires environment variables (loaded from .env file):
 * - YOUTUBE_API_KEY
 * - YOUTUBE_CHANNEL_ID
 * - BEEHIIV_API_KEY
 * - BEEHIIV_PUBLICATION_ID
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'node:process';
import { config } from 'dotenv';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Load environment variables from .env file
config({ path: join(rootDir, '.env') });

const devDataDir = join(rootDir, 'src', 'dev-data');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

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

/**
 * Fetches and saves the latest YouTube video
 */
async function seedYouTubeVideo() {
  console.log('\n📹 Fetching latest YouTube video...');

  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) {
    throw new Error(
      'YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID environment variables are required'
    );
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
      console.warn('⚠️  No videos found in channel');
      return;
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

    // Format video data to match Contentful schema
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

    // Ensure dev-data directory exists
    if (!existsSync(devDataDir)) {
      await mkdir(devDataDir, { recursive: true });
    }

    const filePath = join(devDataDir, 'youtubeVideo.json');
    await writeFile(filePath, JSON.stringify(video, null, 2), 'utf-8');

    console.log(`✅ Saved YouTube video to ${filePath}`);
    console.log(`   Title: ${video.title}`);
    console.log(`   URL: ${video.url}`);
  } catch (error) {
    console.error('❌ Error seeding YouTube video:', error.message);
    throw error;
  }
}

/**
 * Fetches and saves the latest Beehiiv post
 */
async function seedBeehiivPost() {
  console.log('\n📰 Fetching latest Beehiiv post...');

  const API_KEY = process.env.BEEHIIV_API_KEY;
  const PUBLICATION_ID = process.env.BEEHIIV_PUBLICATION_ID;

  if (!API_KEY || !PUBLICATION_ID) {
    throw new Error(
      'BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID environment variables are required'
    );
  }

  try {
    // Make request to Beehiiv API
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUBLICATION_ID}/posts?limit=1&status=confirmed&sort_by=publish_date&direction=desc`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Beehiiv API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      console.warn('⚠️  No posts found');
      return;
    }

    const post = data.data[0];

    // Transform to match the expected format
    const formattedPost = {
      title: post.title,
      description: post.preview_text || post.description || '',
      image: post.thumbnail_url || post.image || './featured-post.png',
      link: post.web_url || post.link,
      publishDate: post.publish_date || post.publishDate,
    };

    // Ensure dev-data directory exists
    if (!existsSync(devDataDir)) {
      await mkdir(devDataDir, { recursive: true });
    }

    const filePath = join(devDataDir, 'featuredPost.json');
    await writeFile(filePath, JSON.stringify(formattedPost, null, 2), 'utf-8');

    console.log(`✅ Saved Beehiiv post to ${filePath}`);
    console.log(`   Title: ${formattedPost.title}`);
    console.log(`   Link: ${formattedPost.link}`);
  } catch (error) {
    console.error('❌ Error seeding Beehiiv post:', error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🌱 Seeding dev fallback data...\n');

  try {
    await seedYouTubeVideo();
    await seedBeehiivPost();

    console.log('\n✨ Dev data seeding complete!');
    console.log(`\n📁 Dev data saved to: ${devDataDir.replace(rootDir, '.')}`);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

main();
