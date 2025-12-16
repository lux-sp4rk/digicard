import { getFeaturedPost } from '../../src/utils/beehiiv';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock localStorage
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: vi.fn(key => {
      return store[key] || null;
    }),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get store() {
      return store;
    },
  };
};

const localStorageMock = createLocalStorageMock();

// Set up localStorage mock for both window and global
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('getFeaturedPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset Date.now mock if it was set
    vi.restoreAllMocks();
  });

  it('fetches post from Netlify function successfully', async () => {
    const mockPost = {
      id: 'post123',
      title: 'Test Blog Post',
      description: 'Test post description',
      web_url: 'https://example.beehiiv.com/p/test-post',
      thumbnail_url: 'https://example.com/thumbnail.jpg',
      publish_date: '2025-01-15T10:00:00Z',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [mockPost] }),
    });

    const result = await getFeaturedPost();

    expect(mockFetch).toHaveBeenCalledWith('/.netlify/functions/beehiiv-proxy');
    expect(result).toEqual(mockPost);
  });

  it('returns null when no posts are available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const result = await getFeaturedPost();

    expect(result).toBeNull();
  });

  it('returns null when fetch fails with network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getFeaturedPost();

    expect(result).toBeNull();
  });

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await getFeaturedPost();

    expect(result).toBeNull();
  });

  it('logs error to console when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Test error'));

    await getFeaturedPost();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching featured post from Beehiiv:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  describe('caching', () => {
    const mockPost = {
      id: 'post123',
      title: 'Test Blog Post',
      description: 'Test post description',
      web_url: 'https://example.beehiiv.com/p/test-post',
      thumbnail_url: 'https://example.com/thumbnail.jpg',
      publish_date: '2025-01-15T10:00:00Z',
    };

    it('caches successful responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockPost] }),
      });

      await getFeaturedPost();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const cachedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(cachedData.data).toEqual(mockPost);
      expect(cachedData.timestamp).toBeDefined();
    });

    it('returns cached data when available and valid', async () => {
      // Set up cache with recent timestamp (within 24 hours)
      const cacheEntry = {
        data: mockPost,
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      };
      localStorageMock.setItem(
        'beehiiv_featured_post',
        JSON.stringify(cacheEntry)
      );
      localStorageMock.getItem.mockClear();

      const result = await getFeaturedPost();

      expect(result).toEqual(mockPost);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('bypasses cache when expired', async () => {
      // Set up expired cache (more than 24 hours old)
      const cacheEntry = {
        data: mockPost,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      };
      localStorageMock.setItem(
        'beehiiv_featured_post',
        JSON.stringify(cacheEntry)
      );
      localStorageMock.getItem.mockClear();
      localStorageMock.removeItem.mockClear();

      const newPost = { ...mockPost, id: 'new123', title: 'New Post' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [newPost] }),
      });

      const result = await getFeaturedPost();

      expect(result).toEqual(newPost);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Should have removed expired cache
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'beehiiv_featured_post'
      );
    });

    it('bypasses cache when missing', async () => {
      // Ensure cache is empty
      localStorageMock.removeItem('beehiiv_featured_post');
      localStorageMock.getItem.mockClear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockPost] }),
      });

      const result = await getFeaturedPost();

      expect(result).toEqual(mockPost);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles corrupted cache gracefully', async () => {
      // Set up corrupted cache
      localStorageMock.setItem('beehiiv_featured_post', 'invalid json');
      localStorageMock.getItem.mockClear();
      localStorageMock.removeItem.mockClear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockPost] }),
      });

      const result = await getFeaturedPost();

      expect(result).toEqual(mockPost);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Should have removed corrupted cache
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'beehiiv_featured_post'
      );
    });

    it('does not cache error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getFeaturedPost();

      expect(result).toBeNull();
      // Should not have cached the error
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('does not cache network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getFeaturedPost();

      expect(result).toBeNull();
      // Should not have cached the error
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('does not cache when no posts are available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const result = await getFeaturedPost();

      expect(result).toBeNull();
      // Should not have cached null result
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles localStorage quota exceeded gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockPost] }),
      });

      const result = await getFeaturedPost();

      expect(result).toEqual(mockPost);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to cache Beehiiv post:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
