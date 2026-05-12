import { getLatestSoundCloudTrack } from '../../src/utils/soundcloud';
import * as cacheUtils from '../../src/utils/cacheUtils';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.spyOn(cacheUtils, 'cacheGet');
vi.spyOn(cacheUtils, 'cacheSet');

describe('soundcloud.js', () => {
  const mockTrack = {
    id: 'track-123',
    title: 'Test Track',
    url: 'https://soundcloud.com/user/test-track',
    thumbnail: 'https://example.com/thumb.jpg',
    publishDate: '2025-01-01T00:00:00Z',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    cacheUtils.cacheGet.mockReturnValue(null);
    cacheUtils.cacheSet.mockClear();
  });

  describe('getLatestSoundCloudTrack', () => {
    it('returns cached data if available', async () => {
      cacheUtils.cacheGet.mockReturnValue(mockTrack);

      const result = await getLatestSoundCloudTrack();

      expect(result).toEqual(mockTrack);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches from Netlify function when cache is empty', async () => {
      cacheUtils.cacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrack,
      });

      const result = await getLatestSoundCloudTrack();

      expect(result).toEqual(mockTrack);
      expect(mockFetch).toHaveBeenCalledWith(
        '/.netlify/functions/soundcloud-latest'
      );
    });

    it('caches successful response', async () => {
      cacheUtils.cacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrack,
      });

      await getLatestSoundCloudTrack();

      expect(cacheUtils.cacheSet).toHaveBeenCalledWith(
        'soundcloud_latest_track',
        mockTrack
      );
    });

    it('does not cache error responses', async () => {
      cacheUtils.cacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await getLatestSoundCloudTrack().catch(() => {});

      expect(cacheUtils.cacheSet).not.toHaveBeenCalled();
    });

    it('returns null on fetch error', async () => {
      cacheUtils.cacheGet.mockReturnValue(null);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getLatestSoundCloudTrack();

      expect(result).toBeNull();
    });

    it('returns null on non-ok response', async () => {
      cacheUtils.cacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getLatestSoundCloudTrack();

      expect(result).toBeNull();
    });
  });
});