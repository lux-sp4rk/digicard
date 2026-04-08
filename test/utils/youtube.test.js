import { getLatestYouTubeVideo } from '../../src/utils/youtube';

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

describe('getLatestYouTubeVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Reset Date.now mock if it was set
    vi.restoreAllMocks();
  });

  it('fetches video from Netlify function successfully', async () => {
    const mockVideo = {
      id: 'abc123',
      title: 'Test Video',
      description: 'Test description',
      url: 'https://www.youtube.com/watch?v=abc123',
      thumbnail: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
      duration: '5:30',
      publishDate: '2025-01-15',
      active: true,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideo,
    });

    const result = await getLatestYouTubeVideo();

    expect(mockFetch).toHaveBeenCalledWith(
      '/.netlify/functions/youtube-latest'
    );
    expect(result).toEqual(mockVideo);
  });

  it('returns null when fetch fails with network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getLatestYouTubeVideo();

    expect(result).toBeNull();
  });

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await getLatestYouTubeVideo();

    expect(result).toBeNull();
  });

  it('logs error to console when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Test error'));

    await getLatestYouTubeVideo();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching latest YouTube video:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  describe('caching', () => {
    const mockVideo = {
      id: 'abc123',
      title: 'Test Video',
      description: 'Test description',
      url: 'https://www.youtube.com/watch?v=abc123',
      thumbnail: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
      duration: '5:30',
      publishDate: '2025-01-15',
      active: true,
    };

    it('caches successful responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideo,
      });

      await getLatestYouTubeVideo();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const cachedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(cachedData.data).toEqual(mockVideo);
      expect(cachedData.timestamp).toBeDefined();
    });

    it('returns cached data when available and valid', async () => {
      // Set up cache with recent timestamp (within 24 hours)
      const cacheEntry = {
        data: mockVideo,
        timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
      };
      localStorageMock.setItem(
        'youtube_latest_video',
        JSON.stringify(cacheEntry)
      );
      localStorageMock.getItem.mockClear();

      const result = await getLatestYouTubeVideo();

      expect(result).toEqual(mockVideo);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('bypasses cache when expired', async () => {
      // Set up expired cache (more than 24 hours old)
      const cacheEntry = {
        data: mockVideo,
        timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      };
      localStorageMock.setItem(
        'youtube_latest_video',
        JSON.stringify(cacheEntry)
      );
      localStorageMock.getItem.mockClear();
      localStorageMock.removeItem.mockClear();

      const newVideo = { ...mockVideo, id: 'new123', title: 'New Video' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newVideo,
      });

      const result = await getLatestYouTubeVideo();

      expect(result).toEqual(newVideo);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Should have removed expired cache
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'youtube_latest_video'
      );
    });

    it('bypasses cache when missing', async () => {
      // Ensure cache is empty
      localStorageMock.removeItem('youtube_latest_video');
      localStorageMock.getItem.mockClear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await getLatestYouTubeVideo();

      expect(result).toEqual(mockVideo);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('handles corrupted cache gracefully', async () => {
      // Set up corrupted cache
      localStorageMock.setItem('youtube_latest_video', 'invalid json');
      localStorageMock.getItem.mockClear();
      localStorageMock.removeItem.mockClear();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await getLatestYouTubeVideo();

      expect(result).toEqual(mockVideo);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Should have removed corrupted cache
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'youtube_latest_video'
      );
    });

    it('does not cache error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getLatestYouTubeVideo();

      expect(result).toBeNull();
      // Should not have cached the error
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('does not cache network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getLatestYouTubeVideo();

      expect(result).toBeNull();
      // Should not have cached the error
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles localStorage quota exceeded gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockVideo,
      });

      const result = await getLatestYouTubeVideo();

      expect(result).toEqual(mockVideo);
      // cacheSet silently fails on quota exceeded — no warning logged
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
