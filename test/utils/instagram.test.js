import {
  getLatestInstagramPost,
  truncateCaption,
} from '../../src/utils/instagram';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock localStorage
const createLocalStorageMock = () => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('getLatestInstagramPost', () => {
  const mockPost = {
    id: 'post123',
    caption: 'Test Instagram post',
    imageUrl: 'https://example.com/image.jpg',
    permalink: 'https://instagram.com/p/ABC123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('fetches post from Netlify function successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    const result = await getLatestInstagramPost();

    expect(mockFetch).toHaveBeenCalledWith(
      '/.netlify/functions/instagram-latest'
    );
    expect(result).toEqual(mockPost);
  });

  it('returns cached data when available and valid', async () => {
    const cacheEntry = {
      data: mockPost,
      timestamp: Date.now() - 1000 * 60 * 60,
    };
    localStorageMock.setItem(
      'instagram_latest_post',
      JSON.stringify(cacheEntry)
    );

    const result = await getLatestInstagramPost();

    expect(result).toEqual(mockPost);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches from API when cache is expired', async () => {
    const expiredCacheEntry = {
      data: mockPost,
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
    };
    localStorageMock.setItem(
      'instagram_latest_post',
      JSON.stringify(expiredCacheEntry)
    );

    const newPost = { ...mockPost, id: 'new456' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => newPost,
    });

    const result = await getLatestInstagramPost();

    expect(result).toEqual(newPost);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fetches from API when cache is missing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    const result = await getLatestInstagramPost();

    expect(result).toEqual(mockPost);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns null when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await getLatestInstagramPost();

    expect(result).toBeNull();
  });

  it('returns null when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve('Internal Server Error'),
    });

    const result = await getLatestInstagramPost();

    expect(result).toBeNull();
  });

  it('logs error to console when fetch fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('Test error'));

    await getLatestInstagramPost();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error fetching latest Instagram post:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('handles corrupted cache gracefully', async () => {
    localStorageMock.setItem('instagram_latest_post', 'invalid json');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    const result = await getLatestInstagramPost();

    expect(result).toEqual(mockPost);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('caches successful responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    await getLatestInstagramPost();

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const cachedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(cachedData.data).toEqual(mockPost);
    expect(cachedData.timestamp).toBeDefined();
  });

  it('does not cache error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve('Internal Server Error'),
    });

    await getLatestInstagramPost();

    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('handles localStorage quota exceeded gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('QuotaExceededError');
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    const result = await getLatestInstagramPost();

    expect(result).toEqual(mockPost);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to cache Instagram post:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('removes expired cache entry', async () => {
    const expiredCacheEntry = {
      data: mockPost,
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
    };
    localStorageMock.setItem(
      'instagram_latest_post',
      JSON.stringify(expiredCacheEntry)
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => mockPost,
    });

    await getLatestInstagramPost();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      'instagram_latest_post'
    );
  });
});

describe('truncateCaption', () => {
  it('returns caption unchanged when under max length', () => {
    expect(truncateCaption('Short caption', 50)).toBe('Short caption');
  });

  it('truncates caption when over max length', () => {
    const result = truncateCaption(
      'This is a very long caption that needs to be truncated',
      20
    );
    expect(result).toBe('This is a very long...');
  });

  it('handles null caption', () => {
    expect(truncateCaption(null)).toBeNull();
  });

  it('handles undefined caption', () => {
    expect(truncateCaption(undefined)).toBeUndefined();
  });

  it('handles empty string', () => {
    expect(truncateCaption('')).toBe('');
  });

  it('uses default max length of 120', () => {
    const result = truncateCaption('a'.repeat(150));
    expect(result).toBe('a'.repeat(120).trim() + '...');
  });
});
