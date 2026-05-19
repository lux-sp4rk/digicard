import { render, screen, waitFor } from '@testing-library/react';
import SoundCloudWidget from '../../src/components/SoundCloudWidget';

const useContentfulMock = vi.hoisted(() => vi.fn());
const getLatestSoundCloudTrackMock = vi.hoisted(() => vi.fn());

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: (...args) => useContentfulMock(...args),
}));

vi.mock('../../src/utils/soundcloud', () => ({
  getLatestSoundCloudTrack: (...args) => getLatestSoundCloudTrackMock(...args),
}));

// Mock fetch and AbortController globally
const mockFetch = vi.fn();
const mockAbortController = vi.fn(() => ({
  abort: vi.fn(),
  signal: {},
}));
Object.assign(globalThis, {
  fetch: mockFetch,
  AbortController: mockAbortController,
});

describe('SoundCloudWidget', () => {
  const mockTrack = {
    active: true,
    title: 'Test Track',
    description: 'Test description',
    url: 'https://soundcloud.com/test/test-track',
    publishDate: '2025-01-01',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockAbortController.mockClear();
    // Default: API returns null (no track), Contentful returns loading
    getLatestSoundCloudTrackMock.mockReturnValue(Promise.resolve(null));
    useContentfulMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
  });

  describe('API integration (new primary source)', () => {
    it('renders track when API fetch succeeds', async () => {
      getLatestSoundCloudTrackMock.mockReturnValue(Promise.resolve(mockTrack));
      useContentfulMock.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      render(<SoundCloudWidget />);

      await waitFor(() => {
        expect(document.querySelector('iframe')).toBeInTheDocument();
      });
    });

    it('shows loading while API fetch is pending', () => {
      let resolveApi;
      getLatestSoundCloudTrackMock.mockReturnValue(
        new Promise(resolve => {
          resolveApi = resolve;
        })
      );
      useContentfulMock.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      render(<SoundCloudWidget />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('falls back to Contentful when API fails', async () => {
      getLatestSoundCloudTrackMock.mockReturnValue(Promise.resolve(null));
      useContentfulMock.mockReturnValue({
        data: mockTrack,
        loading: false,
        error: null,
      });

      render(<SoundCloudWidget />);

      await waitFor(() => {
        expect(document.querySelector('iframe')).toBeInTheDocument();
      });
    });
  });

  describe('fallback chain', () => {
    it('falls back to JSON file when both API and Contentful fail', async () => {
      getLatestSoundCloudTrackMock.mockReturnValue(Promise.resolve(null));
      useContentfulMock.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Contentful failed'),
      });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTrack,
      });

      render(<SoundCloudWidget />);

      await waitFor(() => {
        expect(document.querySelector('iframe')).toBeInTheDocument();
      });
    });

    it('renders nothing when all sources fail', async () => {
      getLatestSoundCloudTrackMock.mockReturnValue(Promise.resolve(null));
      useContentfulMock.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Contentful failed'),
      });
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<SoundCloudWidget />);

      // Should not render iframe
      await waitFor(() => {
        expect(document.querySelector('iframe')).not.toBeInTheDocument();
      });
    });
  });

  describe('original behavior', () => {
    it('renders SoundCloud widget when data is loaded from Contentful', () => {
      useContentfulMock.mockReturnValue({
        data: mockTrack,
        loading: false,
        error: null,
      });

      render(<SoundCloudWidget />);
      expect(document.querySelector('iframe')).toBeInTheDocument();
    });

    it('renders loading state when data is loading', () => {
      useContentfulMock.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<SoundCloudWidget />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('does not render when track.active is false', () => {
      useContentfulMock.mockReturnValue({
        data: { ...mockTrack, active: false },
        loading: false,
        error: null,
      });

      render(<SoundCloudWidget />);
      expect(document.querySelector('iframe')).not.toBeInTheDocument();
    });
  });
});