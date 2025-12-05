import { handler } from '../../netlify/functions/youtube-latest';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('youtube-latest Netlify function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      YOUTUBE_API_KEY: 'test-api-key',
      YOUTUBE_CHANNEL_ID: 'UCtest123channel',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('request validation', () => {
    it('rejects non-GET requests', async () => {
      const result = await handler({ httpMethod: 'POST' });

      expect(result.statusCode).toBe(405);
      expect(JSON.parse(result.body)).toEqual({ error: 'Method not allowed' });
    });

    it('returns 500 when API key is missing', async () => {
      delete process.env.YOUTUBE_API_KEY;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'YouTube API key or Channel ID is not configured',
      });
    });

    it('returns 500 when channel ID is missing', async () => {
      delete process.env.YOUTUBE_CHANNEL_ID;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'YouTube API key or Channel ID is not configured',
      });
    });
  });

  describe('YouTube API integration', () => {
    const mockPlaylistResponse = {
      items: [
        {
          snippet: {
            title: 'Latest Video Title',
            description: 'Latest video description',
            publishedAt: '2025-01-20T12:00:00Z',
            resourceId: { videoId: 'abc123xyz' },
            thumbnails: {
              maxres: {
                url: 'https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg',
              },
              high: {
                url: 'https://img.youtube.com/vi/abc123xyz/hqdefault.jpg',
              },
            },
          },
        },
      ],
    };

    const mockVideoResponse = {
      items: [
        {
          contentDetails: {
            duration: 'PT10M30S',
          },
        },
      ],
    };

    it('fetches latest video successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body).toEqual({
        id: 'abc123xyz',
        title: 'Latest Video Title',
        description: 'Latest video description',
        url: 'https://www.youtube.com/watch?v=abc123xyz',
        thumbnail: 'https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg',
        duration: '10:30',
        publishDate: '2025-01-20T12:00:00Z',
        active: true,
      });
    });

    it('converts channel ID to uploads playlist ID correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse,
        });

      await handler({ httpMethod: 'GET' });

      // First call should be to playlistItems with UU prefix
      const firstCallUrl = mockFetch.mock.calls[0][0];
      expect(firstCallUrl).toContain('playlistId=UUtest123channel');
    });

    it('includes cache headers in response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Cache-Control']).toContain('s-maxage=86400');
      expect(result.headers['Cache-Control']).toContain(
        'stale-while-revalidate'
      );
    });

    it('includes CORS headers in response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('returns 404 when no videos found in channel', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        error: 'No videos found in channel',
      });
    });

    it('handles YouTube API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => 'Quota exceeded',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest video from YouTube',
      });
    });

    it('handles missing video details gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.duration).toBeNull();
    });
  });

  describe('duration formatting', () => {
    it('formats hours, minutes, and seconds correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    high: { url: 'https://example.com/thumb.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT1H2M3S' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.duration).toBe('1:02:03');
    });

    it('formats minutes and seconds without hours', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    high: { url: 'https://example.com/thumb.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT5M30S' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.duration).toBe('5:30');
    });

    it('handles seconds-only duration', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    high: { url: 'https://example.com/thumb.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT45S' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.duration).toBe('0:45');
    });
  });

  describe('thumbnail fallback', () => {
    it('uses maxres thumbnail when available', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    maxres: { url: 'https://example.com/maxres.jpg' },
                    high: { url: 'https://example.com/high.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT1M' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.thumbnail).toBe('https://example.com/maxres.jpg');
    });

    it('falls back to high quality thumbnail', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    high: { url: 'https://example.com/high.jpg' },
                    medium: { url: 'https://example.com/medium.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT1M' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.thumbnail).toBe('https://example.com/high.jpg');
    });

    it('falls back to medium quality thumbnail', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                snippet: {
                  title: 'Test',
                  description: 'Test',
                  publishedAt: '2025-01-20T12:00:00Z',
                  resourceId: { videoId: 'abc123' },
                  thumbnails: {
                    medium: { url: 'https://example.com/medium.jpg' },
                  },
                },
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ contentDetails: { duration: 'PT1M' } }],
          }),
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.thumbnail).toBe('https://example.com/medium.jpg');
    });
  });
});
