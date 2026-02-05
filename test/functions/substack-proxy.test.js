import { handler } from '../../netlify/functions/substack-proxy';

// Mock fetch globally using vi.stubGlobal to ensure it's properly mocked
const mockFetch = vi.fn(() => {
  throw new Error('Real fetch was called - mock is not working!');
});
vi.stubGlobal('fetch', mockFetch);

// Sample RSS XML that mimics Substack's feed format
const createMockRSS = (posts = []) => {
  const items = posts
    .map(
      post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${post.link}</link>
      <pubDate>${post.pubDate}</pubDate>
      <description><![CDATA[${post.description}]]></description>
      <content:encoded><![CDATA[${post.content || `<p>${post.description}</p>`}]]></content:encoded>
    </item>
  `
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Test Newsletter</title>
    <link>https://test.substack.com</link>
    <description>A test newsletter</description>
    ${items}
  </channel>
</rss>`;
};

describe('substack-proxy Netlify function', () => {
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
      SUBSTACK_URL: 'test.substack.com',
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

    it('returns 500 when SUBSTACK_URL is missing', async () => {
      delete process.env.SUBSTACK_URL;

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'SUBSTACK_URL environment variable is not configured',
      });
    });
  });

  describe('Substack RSS integration', () => {
    const mockPost = {
      title: 'The Crustafarians Passed the Test',
      link: 'https://test.substack.com/p/the-crustafarians-passed-the-test',
      pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
      description:
        'The bar for sentience was always lower than we thought — and 770,000 AI agents just cleared it.',
      content:
        '<img src="https://substackcdn.com/image/test.jpg" /><p>Article content here</p>',
    };

    it('fetches latest post successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe(mockPost.title);
      expect(body.data[0].link).toBe(mockPost.link);
      expect(body.data[0].description).toBe(mockPost.description);
    });

    it('constructs correct feed URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
      });

      await handler({ httpMethod: 'GET' });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toBe('https://test.substack.com/feed');
    });

    it('normalizes SUBSTACK_URL with trailing slash', async () => {
      process.env.SUBSTACK_URL = 'test.substack.com/';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
      });

      await handler({ httpMethod: 'GET' });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toBe('https://test.substack.com/feed');
    });

    it('normalizes SUBSTACK_URL with https prefix', async () => {
      process.env.SUBSTACK_URL = 'https://test.substack.com';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
      });

      await handler({ httpMethod: 'GET' });

      const callUrl = mockFetch.mock.calls[0][0];
      expect(callUrl).toBe('https://test.substack.com/feed');
    });

    it('includes correct request headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
      });

      await handler({ httpMethod: 'GET' });

      const callOptions = mockFetch.mock.calls[0][1];
      expect(callOptions.headers['User-Agent']).toBe('DigiCard/1.0');
      expect(callOptions.headers['Accept']).toContain('application/rss+xml');
    });

    it('includes cache headers in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([mockPost]),
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
        text: async () => createMockRSS([mockPost]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Headers']).toBe(
        'Content-Type'
      );
      expect(result.headers['Access-Control-Allow-Methods']).toBe('GET');
    });

    it('handles RSS fetch errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch posts from Substack',
      });
    });

    it('handles network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({
        error: 'Failed to fetch posts from Substack',
      });
    });

    it('returns empty array when no posts in feed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([]),
      });

      const result = await handler({ httpMethod: 'GET' });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.data).toEqual([]);
    });

    it('logs errors to console when fetch fails', async () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error('RSS error'));

      await handler({ httpMethod: 'GET' });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching from Substack:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('RSS parsing', () => {
    it('extracts thumbnail from content HTML', async () => {
      const postWithImage = {
        title: 'Post with Image',
        link: 'https://test.substack.com/p/post-with-image',
        pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
        description: 'A post with an image',
        content:
          '<img src="https://substackcdn.com/image/fetch/test-image.jpg" alt="test" /><p>Content</p>',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([postWithImage]),
      });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.data[0].thumbnail_url).toBe(
        'https://substackcdn.com/image/fetch/test-image.jpg'
      );
    });

    it('handles posts without images', async () => {
      const postWithoutImage = {
        title: 'Post without Image',
        link: 'https://test.substack.com/p/post-without-image',
        pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
        description: 'A post without an image',
        content: '<p>Just text content here</p>',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([postWithoutImage]),
      });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.data[0].thumbnail_url).toBe('');
    });

    it('parses multiple posts but returns only the first', async () => {
      const posts = [
        {
          title: 'First Post',
          link: 'https://test.substack.com/p/first',
          pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
          description: 'First post description',
        },
        {
          title: 'Second Post',
          link: 'https://test.substack.com/p/second',
          pubDate: 'Wed, 04 Feb 2026 10:00:00 GMT',
          description: 'Second post description',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS(posts),
      });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      // Should only return the first (latest) post
      expect(body.data).toHaveLength(1);
      expect(body.data[0].title).toBe('First Post');
    });

    it('handles CDATA wrapped content', async () => {
      const post = {
        title: 'Post with <special> characters & entities',
        link: 'https://test.substack.com/p/special-chars',
        pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
        description: 'Description with "quotes" and <tags>',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([post]),
      });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.data[0].title).toBe(
        'Post with <special> characters & entities'
      );
      expect(body.data[0].description).toBe(
        'Description with "quotes" and <tags>'
      );
    });

    it('includes source and feedUrl in response', async () => {
      const post = {
        title: 'Test Post',
        link: 'https://test.substack.com/p/test',
        pubDate: 'Thu, 05 Feb 2026 13:55:32 GMT',
        description: 'Test description',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => createMockRSS([post]),
      });

      const result = await handler({ httpMethod: 'GET' });
      const body = JSON.parse(result.body);

      expect(body.source).toBe('substack');
      expect(body.feedUrl).toBe('https://test.substack.com/feed');
    });
  });
});
