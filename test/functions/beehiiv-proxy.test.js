import { handler } from '../../netlify/functions/beehiiv-proxy';

// Mock fetch globally using vi.stubGlobal to ensure it's properly mocked
// This prevents any real API calls during testing
const mockFetch = vi.fn(() => {
  throw new Error('Real fetch was called - mock is not working!');
});
vi.stubGlobal('fetch', mockFetch);

describe('beehiiv-proxy Netlify function', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure fetch is still mocked after clearAllMocks
    // Reset to throw error by default, then each test will override with mockResolvedValueOnce
    mockFetch.mockImplementation(() => {
      throw new Error(
        'Real fetch was called - mock is not working! Make sure to set up mockFetch.mockResolvedValueOnce() in your test.'
      );
    });
    vi.stubGlobal('fetch', mockFetch);
    process.env = {
      ...originalEnv,
      BEEHIIV_API_KEY: 'test-api-key',
      BEEHIIV_PUBLICATION_ID: 'test-publication-id',
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
      delete process.env.BEEHIIV_API_KEY;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Beehiiv API key or Publication ID is not configured',
      });
    });

    it('returns 500 when publication ID is missing', async () => {
      delete process.env.BEEHIIV_PUBLICATION_ID;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Beehiiv API key or Publication ID is not configured',
      });
    });
  });

  describe('Beehiiv API integration', () => {
    const mockBeehiivResponse = {
      data: [
        {
          id: 'post123',
          title: 'Latest Blog Post',
          description: 'This is the latest post',
          web_url: 'https://example.beehiiv.com/p/latest-post',
          thumbnail_url: 'https://example.com/thumbnail.jpg',
          preview_text: 'Post preview text',
          publish_date: '2025-01-20T12:00:00Z',
          status: 'confirmed',
        },
      ],
      page: 1,
      limit: 1,
      total_results: 1,
      total_pages: 1,
    };

    it('fetches latest post successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBeehiivResponse,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body).toEqual(mockBeehiivResponse);
    });

    it('includes correct API request parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBeehiivResponse,
      });

      await handler({ httpMethod: 'GET' });

      // Verify the API call was made with correct parameters
      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toContain('test-publication-id');
      expect(callUrl).toContain('limit=1');
      expect(callUrl).toContain('status=confirmed');
      expect(callUrl).toContain('sort_by=publish_date');
      expect(callUrl).toContain('direction=desc');
    });

    it('includes correct authorization header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBeehiivResponse,
      });

      await handler({ httpMethod: 'GET' });

      const callOptions = mockFetch.mock.calls[0][1];
      expect(callOptions.headers.Authorization).toBe('Bearer test-api-key');
    });

    it('includes cache headers in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBeehiivResponse,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Cache-Control']).toContain('s-maxage=86400');
      expect(result.headers['Cache-Control']).toContain(
        'stale-while-revalidate'
      );
    });

    it('includes CORS headers in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBeehiivResponse,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type'
      );
      expect(result.headers['Access-Control-Allow-Methods']).toBe('GET');
    });

    it('handles Beehiiv API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch posts from Beehiiv',
      });
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch posts from Beehiiv',
      });
    });

    it('returns data even when posts array is empty', async () => {
      const emptyResponse = {
        data: [],
        page: 1,
        limit: 1,
        total_results: 0,
        total_pages: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResponse,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.data).toEqual([]);
    });

    it('logs errors to console when API fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('API error'));

      await handler({ httpMethod: 'GET' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching from Beehiiv:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('response structure', () => {
    it('preserves all post fields from Beehiiv API', async () => {
      const mockPost = {
        id: 'post123',
        title: 'Test Post',
        description: 'Test description',
        web_url: 'https://example.beehiiv.com/p/test',
        thumbnail_url: 'https://example.com/thumb.jpg',
        preview_text: 'Preview text',
        publish_date: '2025-01-20T12:00:00Z',
        status: 'confirmed',
        authors: ['John Doe'],
        content: { html: '<p>Content</p>' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [mockPost],
          page: 1,
          limit: 1,
          total_results: 1,
          total_pages: 1,
        }),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.data[0]).toEqual(mockPost);
    });

    it('returns complete pagination metadata', async () => {
      const mockResponse = {
        data: [
          {
            id: 'post123',
            title: 'Test Post',
          },
        ],
        page: 1,
        limit: 1,
        total_results: 10,
        total_pages: 10,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(1);
      expect(body.total_results).toBe(10);
      expect(body.total_pages).toBe(10);
    });
  });
});
