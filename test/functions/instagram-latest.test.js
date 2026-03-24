import { handler } from '../../netlify/functions/instagram-latest';

// Mock fetch globally using vi.stubGlobal to ensure it's properly mocked
const mockFetch = vi.fn(() => {
  throw new Error('Real fetch was called - mock is not working!');
});
vi.stubGlobal('fetch', mockFetch);

describe('instagram-latest Netlify function', () => {
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
      RAPIDAPI_KEY: 'test-rapidapi-key',
      INSTAGRAM_USERNAME: 'testuser',
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

    it('returns 500 when RapidAPI key is missing', async () => {
      delete process.env.RAPIDAPI_KEY;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'RapidAPI key is not configured',
      });
    });

    it('uses default username when INSTAGRAM_USERNAME is not set', async () => {
      delete process.env.INSTAGRAM_USERNAME;

      const mockPost = {
        id: '123456',
        code: 'ABC123',
        caption: { text: 'Test caption' },
        image_versions: {
          items: [{ url: 'https://example.com/image.jpg' }],
        },
        taken_at: 1705689600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [mockPost] },
        }),
      });

      await handler({ httpMethod: 'GET' });

      // Should use default username 'lux_sp4rk'
      const fetchCall = mockFetch.mock.calls[0][0];
      expect(fetchCall).toContain('username=lux_sp4rk');
    });
  });

  describe('Instagram API integration', () => {
    const mockPost = {
      id: '123456',
      pk: '123456',
      code: 'ABC123',
      shortcode: 'ABC123',
      caption: { text: 'Test Instagram caption' },
      image_versions: {
        items: [{ url: 'https://example.com/image.jpg' }],
      },
      media_url: 'https://example.com/media.jpg',
      thumbnail_url: 'https://example.com/thumb.jpg',
      taken_at: 1705689600,
    };

    it('fetches latest post successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [mockPost] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.id).toBe('123456');
      expect(body.caption).toBe('Test Instagram caption');
      expect(body.imageUrl).toBe('https://example.com/image.jpg');
      expect(body.permalink).toBe('https://instagram.com/p/ABC123/');
      expect(body.active).toBe(true);
      expect(body.publishDate).toBeDefined();
      expect(new Date(body.publishDate)).toBeInstanceOf(Date);
    });

    it('handles alternative response structure (data.data)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [mockPost],
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.id).toBe('123456');
    });

    it('handles post with string caption', async () => {
      const postWithStringCaption = {
        ...mockPost,
        caption: 'Plain string caption',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithStringCaption] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.caption).toBe('Plain string caption');
    });

    it('falls back to media_url when image_versions is not available', async () => {
      const postWithoutImageVersions = {
        ...mockPost,
        image_versions: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithoutImageVersions] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/media.jpg');
    });

    it('falls back to thumbnail_url when other sources unavailable', async () => {
      const postWithOnlyThumbnail = {
        ...mockPost,
        image_versions: undefined,
        media_url: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithOnlyThumbnail] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/thumb.jpg');
    });

    it('uses pk as fallback when id is missing', async () => {
      const postWithOnlyPk = {
        ...mockPost,
        id: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithOnlyPk] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.id).toBe('123456');
    });

    it('uses code as fallback when shortcode is missing', async () => {
      const postWithOnlyCode = {
        ...mockPost,
        shortcode: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithOnlyCode] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.permalink).toBe('https://instagram.com/p/ABC123/');
    });

    it('handles missing taken_at timestamp', async () => {
      const postWithoutTimestamp = {
        ...mockPost,
        taken_at: undefined,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [postWithoutTimestamp] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.publishDate).toBeDefined();
      expect(new Date(body.publishDate)).toBeInstanceOf(Date);
    });

    it('returns 404 when no posts found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: [] },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        error: 'No posts found for user',
      });
    });

    it('handles null posts array gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { items: null },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      // When posts is null, the code throws an error and returns 500
      expect(result.statusCode).toBe(500);
    });

    it('handles RapidAPI errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest post from Instagram',
      });
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest post from Instagram',
      });
    });
  });

  describe('response headers', () => {
    it('includes cache headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            items: [
              {
                id: '123',
                code: 'ABC',
                caption: { text: 'Test' },
                taken_at: 1705689600,
              },
            ],
          },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Cache-Control']).toContain('s-maxage=86400');
      expect(result.headers['Cache-Control']).toContain(
        'stale-while-revalidate=3600'
      );
    });

    it('includes CORS headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            items: [
              {
                id: '123',
                code: 'ABC',
                caption: { text: 'Test' },
                taken_at: 1705689600,
              },
            ],
          },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type'
      );
      expect(result.headers['Access-Control-Allow-Methods']).toBe('GET');
    });

    it('sets correct content type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            items: [
              {
                id: '123',
                code: 'ABC',
                caption: { text: 'Test' },
                taken_at: 1705689600,
              },
            ],
          },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Content-Type']).toBe('application/json');
    });
  });
});
