import { handler } from '../../netlify/functions/soundcloud-latest';

// Mock fetch globally
const mockFetch = vi.fn(() => {
  throw new Error('Real fetch was called - mock is not working!');
});
vi.stubGlobal('fetch', mockFetch);

describe('soundcloud-latest Netlify function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockImplementation(() => {
      throw new Error(
        'Real fetch was called - mock is not working! Make sure to set up mockFetch.mockResolvedValueOnce() in your test.'
      );
    });
    vi.stubGlobal('fetch', mockFetch);
    process.env = {
      ...originalEnv,
      SOUNDCLOUD_USER_URL: 'https://soundcloud.com/testuser',
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

    it('returns 500 when user URL is missing', async () => {
      delete process.env.SOUNDCLOUD_USER_URL;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'SoundCloud user URL is not configured',
      });
    });
  });

  describe('SoundCloud profile scraping', () => {
    const mockProfileHtml = `
      <html>
        <body>
          <script>
            someVar = "https://soundcloud.com/testuser/track-one";
          </script>
        </body>
      </html>
    `;

    const mockOembedResponse = {
      title: 'Test Track',
      url: 'https://soundcloud.com/testuser/track-one',
      thumbnail_url: 'https://example.com/thumb.jpg',
    };

    it('fetches latest track successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body).toMatchObject({
        title: 'Test Track',
        url: 'https://soundcloud.com/testuser/track-one',
        thumbnail: 'https://example.com/thumb.jpg',
        active: true,
      });
      expect(body.id).toBeTruthy();
      expect(body.publishDate).toBeTruthy();
    });

    it('includes cache headers in response', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
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
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('returns 404 when no tracks found in profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<html><body>No tracks here</body></html>',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        error: 'No tracks found on SoundCloud profile',
      });
    });

    it('handles profile fetch error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest track from SoundCloud',
      });
    });

    it('handles oEmbed error gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest track from SoundCloud',
      });
    });

    it('filters out set URLs from track discovery', async () => {
      const htmlWithSets = `
        <html>
          <script>
            var track1 = "https://soundcloud.com/testuser/sets/compilation";
            var track2 = "https://soundcloud.com/testuser/real-track";
          </script>
        </html>
      `;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => htmlWithSets,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      // Should use the real track, not the set
      const body = JSON.parse(result.body);
      expect(body.url).toContain('/real-track');
    });
  });

  describe('track metadata extraction', () => {
    it('uses oEmbed URL when available', async () => {
      const mockProfileHtml = `
        <html>
          <script>
            someVar = "https://soundcloud.com/testuser/track-one";
          </script>
        </html>
      `;

      const mockOembedResponse = {
        title: 'Test Track',
        url: 'https://soundcloud.com/testuser/track-one', // oEmbed might normalize URL
        thumbnail_url: 'https://example.com/thumb.jpg',
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.url).toBe('https://soundcloud.com/testuser/track-one');
    });

    it('falls back to scraped URL when oEmbed url is missing', async () => {
      const mockProfileHtml = `
        <html>
          <script>
            someVar = "https://soundcloud.com/testuser/track-from-scraping";
          </script>
        </html>
      `;

      const mockOembedResponse = {
        title: 'Test Track',
        // No url field
        thumbnail_url: null,
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.url).toBe('https://soundcloud.com/testuser/track-from-scraping');
    });

    it('handles null thumbnail gracefully', async () => {
      const mockProfileHtml = `
        <html>
          <script>
            someVar = "https://soundcloud.com/testuser/track-one";
          </script>
        </html>
      `;

      const mockOembedResponse = {
        title: 'Test Track',
        url: 'https://soundcloud.com/testuser/track-one',
        thumbnail_url: null,
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockProfileHtml,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockOembedResponse,
        });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.thumbnail).toBeNull();
    });
  });
});