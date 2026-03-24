import { handler } from '../../netlify/functions/instagram-latest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('instagram-latest Netlify function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
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

    it('sends POST request with username in body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: { edges: [], page_info: {}, version: '1.0' },
        }),
      });

      await handler({ httpMethod: 'GET' });

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe(
        'https://instagram120.p.rapidapi.com/api/instagram/posts'
      );
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.username).toBe('testuser');
    });

    it('uses default username when INSTAGRAM_USERNAME is not set', async () => {
      delete process.env.INSTAGRAM_USERNAME;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: { edges: [], page_info: {}, version: '1.0' },
        }),
      });

      await handler({ httpMethod: 'GET' });

      const [, options] = mockFetch.mock.calls[0];
      const body = JSON.parse(options.body);
      expect(body.username).toBe('lux_sp4rk'); // default
    });
  });

  describe('Instagram API integration', () => {
    const makeMockNode = overrides => ({
      id: '123456',
      pk: '123456',
      code: 'ABC123',
      caption: { text: 'Test Instagram caption' },
      image_versions2: {
        candidates: [{ url: 'https://example.com/image.jpg' }],
      },
      thumbnail_url: 'https://example.com/thumb.jpg',
      media_url: 'https://example.com/media.jpg',
      display_url: 'https://example.com/display.jpg',
      taken_at: 1705689600,
      ...overrides,
    });

    const makeMockResponse = nodes => ({
      result: {
        edges: nodes.map(node => ({ node })),
        page_info: {},
        version: '1.0',
      },
    });

    it('fetches latest post successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeMockResponse([makeMockNode()]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.id).toBe('123456');
      expect(body.caption).toBe('Test Instagram caption');
      // thumbnail_url is truthy in default mockNode, so it takes priority
      expect(body.imageUrl).toBe('https://example.com/thumb.jpg');
      expect(body.permalink).toBe('https://instagram.com/p/ABC123/');
      expect(body.active).toBe(true);
      expect(body.publishDate).toBeDefined();
      expect(new Date(body.publishDate)).toBeInstanceOf(Date);
    });

    it('prefers thumbnail_url over image_versions2', async () => {
      const mockNode = {
        id: '123456',
        pk: '123456',
        code: 'ABC123',
        caption: { text: 'Test Instagram caption' },
        thumbnail_url: 'https://example.com/thumb.jpg',
        image_versions2: {
          candidates: [{ url: 'https://example.com/image.jpg' }],
        },
        taken_at: 1705689600,
      };
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            result: {
              edges: [{ node: mockNode }],
              page_info: {},
              version: '1.0',
            },
          }),
        })
      );

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/thumb.jpg');

      mockFetch.mockImplementation(undefined); // reset for subsequent tests
    });

    it('falls back to image_versions2.candidates[0].url when thumbnail_url absent', async () => {
      const mockNode = {
        id: '123456',
        pk: '123456',
        code: 'ABC123',
        caption: { text: 'Test Instagram caption' },
        thumbnail_url: null,
        image_versions2: {
          candidates: [{ url: 'https://example.com/candidate.jpg' }],
        },
        taken_at: 1705689600,
      };
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            result: {
              edges: [{ node: mockNode }],
              page_info: {},
              version: '1.0',
            },
          }),
        })
      );

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/candidate.jpg');

      mockFetch.mockImplementation(undefined); // reset for subsequent tests
    });

    it('falls back to media_url when image_versions2 unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeMockResponse([
            makeMockNode({
              thumbnail_url: undefined,
              image_versions2: undefined,
              media_url: 'https://example.com/media.jpg',
            }),
          ]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/media.jpg');
    });

    it('falls back to display_url when other sources unavailable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeMockResponse([
            makeMockNode({
              thumbnail_url: undefined,
              image_versions2: undefined,
              media_url: undefined,
              display_url: 'https://example.com/display.jpg',
            }),
          ]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.imageUrl).toBe('https://example.com/display.jpg');
    });

    it('uses pk as fallback when id is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeMockResponse([makeMockNode({ id: undefined, pk: '123456' })]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.id).toBe('123456');
    });

    it('uses code as fallback for permalink', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeMockResponse([makeMockNode({ code: 'XYZ789' })]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.permalink).toBe('https://instagram.com/p/XYZ789/');
    });

    it('handles missing taken_at timestamp', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeMockResponse([makeMockNode({ taken_at: undefined })]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.publishDate).toBeDefined();
      expect(new Date(body.publishDate)).toBeInstanceOf(Date);
    });

    it('handles string caption', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          makeMockResponse([makeMockNode({ caption: 'Plain string caption' })]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.caption).toBe('Plain string caption');
    });

    it('returns 404 when no posts found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => makeMockResponse([]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body)).toEqual({
        error: 'No posts found for user',
      });
    });

    it('handles null edges gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: { edges: null, page_info: {}, version: '1.0' },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      // null edges → empty array → 404
      expect(result.statusCode).toBe(404);
    });

    it('handles RapidAPI errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(429);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch latest post from Instagram',
        details: 'Network error',
      });
    });
  });

  describe('response headers', () => {
    it('includes cache headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            edges: [
              {
                node: {
                  id: '123',
                  code: 'ABC',
                  caption: { text: 'Test' },
                  taken_at: 1705689600,
                },
              },
            ],
            page_info: {},
            version: '1.0',
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
        status: 200,
        json: async () => ({
          result: {
            edges: [
              {
                node: {
                  id: '123',
                  code: 'ABC',
                  caption: { text: 'Test' },
                  taken_at: 1705689600,
                },
              },
            ],
            page_info: {},
            version: '1.0',
          },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    });

    it('sets correct content type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          result: {
            edges: [
              {
                node: {
                  id: '123',
                  code: 'ABC',
                  caption: { text: 'Test' },
                  taken_at: 1705689600,
                },
              },
            ],
            page_info: {},
            version: '1.0',
          },
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Content-Type']).toBe('application/json');
    });
  });
});
