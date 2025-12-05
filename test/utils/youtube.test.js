import { getLatestYouTubeVideo } from '../../src/utils/youtube';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('getLatestYouTubeVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
