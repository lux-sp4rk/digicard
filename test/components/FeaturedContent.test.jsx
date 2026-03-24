import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock hooks before importing component
const { mockUseContentful, mockUseSubstack, mockGetLatestYouTubeVideo } =
  vi.hoisted(() => ({
    mockUseContentful: vi.fn(),
    mockUseSubstack: vi.fn(),
    mockGetLatestYouTubeVideo: vi.fn(),
  }));

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: (...args) => mockUseContentful(...args),
}));

vi.mock('../../src/hooks/useSubstack', () => ({
  useSubstack: () => mockUseSubstack(),
}));

vi.mock('../../src/utils/youtube', () => ({
  getLatestYouTubeVideo: (...args) => mockGetLatestYouTubeVideo(...args),
}));

// Mock instagram utility
vi.mock('../../src/utils/instagram', () => ({
  getLatestInstagramPost: vi.fn().mockResolvedValue(null),
  truncateCaption: vi.fn(text => text),
}));

// Mock fallback data - return null so tests don't see fallback
vi.mock('../../src/dev-data/youtubeVideo.json', () => ({
  default: null,
}));

vi.mock('../../src/dev-data/featuredPost.json', () => ({
  default: null,
}));

// Mock child components
vi.mock('../../src/components/YouTubeCard', () => ({
  default: ({ video }) => (
    <div data-testid="youtube-card" data-title={video?.title}>
      YouTube: {video?.title}
    </div>
  ),
}));

vi.mock('../../src/components/SubstackCard', () => ({
  default: ({ post }) => (
    <div data-testid="substack-card" data-title={post?.title}>
      Substack: {post?.title}
    </div>
  ),
}));

vi.mock('../../src/components/Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}));

// Import component after mocks
import FeaturedContent from '../../src/components/FeaturedContent';

describe('FeaturedContent', () => {
  const mockYouTubeVideo = {
    id: 'youtube-123',
    title: 'Latest YouTube Video',
    description: 'A YouTube video',
    url: 'https://www.youtube.com/watch?v=xyz789',
    thumbnail: 'https://example.com/youtube-thumb.jpg',
    duration: '10:30',
    publishDate: '2025-02-01T00:00:00Z',
    active: true,
  };

  const mockSubstackPost = {
    title: 'Latest Substack Post',
    description: 'A Substack post',
    thumbnail_url: 'https://example.com/substack-thumb.jpg',
    link: 'https://example.com/substack-post',
    pubDate: 'Mon, 20 Jan 2025 11:00:00 GMT',
  };

  // Store original DEV value
  let originalDev;

  beforeEach(() => {
    vi.clearAllMocks();
    originalDev = import.meta.env.DEV;
    // Set DEV to false for most tests to avoid fallback data interference
    import.meta.env.DEV = false;

    // Default mocks - both sources return data
    mockUseContentful.mockImplementation(fn => {
      const fnString = fn.toString();
      if (fnString.includes('getYouTubeVideo')) {
        return {
          data: mockYouTubeVideo,
          loading: false,
          error: null,
        };
      }
      return { data: null, loading: false, error: null };
    });

    mockUseSubstack.mockReturnValue({
      post: mockSubstackPost,
      loading: false,
    });

    // Default: API returns active video
    mockGetLatestYouTubeVideo.mockResolvedValue(mockYouTubeVideo);
  });

  afterEach(() => {
    // Restore DEV value
    import.meta.env.DEV = originalDev;
  });

  // Helper to render and wait for async effects
  const renderAndWait = async (delay = 0) => {
    await act(async () => {
      render(<FeaturedContent theme="dark" />);
    });
    // Wait for any async effects to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, delay));
    });
  };

  describe('Ordering by recency', () => {
    it('renders YouTube first when it is newer', async () => {
      // YouTube: 2025-02-01 (newer)
      // Substack: 2025-01-20 (older)
      await renderAndWait();

      await waitFor(() => {
        const cards = screen.getAllByTestId(/-card$/);
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveAttribute('data-testid', 'youtube-card');
        expect(cards[1]).toHaveAttribute('data-testid', 'substack-card');
      });
    });

    it('renders Substack first when it is newer', async () => {
      // Make Substack newer
      mockUseSubstack.mockReturnValue({
        post: {
          ...mockSubstackPost,
          pubDate: 'Mon, 10 Feb 2025 11:00:00 GMT', // Newer than YouTube
        },
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        const cards = screen.getAllByTestId(/-card$/);
        expect(cards).toHaveLength(2);
        expect(cards[0]).toHaveAttribute('data-testid', 'substack-card');
        expect(cards[1]).toHaveAttribute('data-testid', 'youtube-card');
      });
    });

    it('handles same-day dates correctly', async () => {
      // Both on same day, YouTube has later time
      mockUseSubstack.mockReturnValue({
        post: {
          ...mockSubstackPost,
          pubDate: 'Sat, 01 Feb 2025 00:00:00 GMT', // Same day, earlier time
        },
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        const cards = screen.getAllByTestId(/-card$/);
        expect(cards).toHaveLength(2);
        // YouTube should be first (same day but full ISO timestamp includes time)
        expect(cards[0]).toHaveAttribute('data-testid', 'youtube-card');
      });
    });

    it('handles RSS date format correctly', async () => {
      mockUseSubstack.mockReturnValue({
        post: {
          ...mockSubstackPost,
          pubDate: 'Sun, 02 Feb 2025 15:30:45 GMT', // RSS format
        },
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        // Substack should appear first (Feb 2 vs Feb 1)
        const cards = screen.getAllByTestId(/-card$/);
        expect(cards[0]).toHaveAttribute('data-testid', 'substack-card');
      });
    });

    it('handles ISO date format correctly', async () => {
      // Reset API mock to return null so it doesn't interfere
      mockGetLatestYouTubeVideo.mockResolvedValue(null);

      // Make YouTube older (Jan 15) so Substack (Jan 20) comes first
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: {
              ...mockYouTubeVideo,
              publishDate: '2025-01-15T14:30:00.000Z', // Jan 15, older than Substack's Jan 20
            },
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });

      await renderAndWait(50); // Longer delay for this async test

      await waitFor(() => {
        // Substack (Jan 20) should come before YouTube (Jan 15) since Substack is newer
        const cards = screen.getAllByTestId(/-card$/);
        expect(cards.length).toBeGreaterThanOrEqual(1);
        expect(cards[0]).toHaveAttribute('data-testid', 'substack-card');
      });
    });
  });

  describe('Single content source', () => {
    it('renders only YouTube when Substack is null', async () => {
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        expect(screen.getByTestId('youtube-card')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('substack-card')).not.toBeInTheDocument();
    });

    it('renders only Substack when YouTube is inactive', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: { ...mockYouTubeVideo, active: false },
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      // API returns null so no fallback video is shown
      mockGetLatestYouTubeVideo.mockResolvedValue(null);

      await renderAndWait();

      await waitFor(() => {
        expect(screen.queryByTestId('youtube-card')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('substack-card')).toBeInTheDocument();
    });

    it('renders only Substack when YouTube has no publish date', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: { ...mockYouTubeVideo, publishDate: null },
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      // API returns null so no fallback video is shown
      mockGetLatestYouTubeVideo.mockResolvedValue(null);

      await renderAndWait();

      await waitFor(() => {
        expect(screen.queryByTestId('youtube-card')).not.toBeInTheDocument();
      });
      expect(screen.getByTestId('substack-card')).toBeInTheDocument();
    });

    it('renders only YouTube when Substack has no pubDate', async () => {
      mockUseSubstack.mockReturnValue({
        post: { ...mockSubstackPost, pubDate: null, publishDate: null },
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        expect(screen.getByTestId('youtube-card')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('substack-card')).not.toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('shows loading when all three sources are loading', async () => {
      mockUseContentful.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: true,
      });
      // Keep Instagram API from resolving so it stays in loading state
      const { getLatestInstagramPost } =
        await import('../../src/utils/instagram');
      vi.mocked(getLatestInstagramPost).mockImplementation(
        () => new Promise(() => {})
      );

      await act(async () => {
        render(<FeaturedContent theme="dark" />);
      });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('renders content when data is available even if still loading', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: mockYouTubeVideo,
            loading: true, // Still loading but data available
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      mockUseSubstack.mockReturnValue({
        post: mockSubstackPost,
        loading: true,
      });

      await renderAndWait();

      await waitFor(() => {
        // Should render content since data is available
        expect(screen.getByTestId('youtube-card')).toBeInTheDocument();
        expect(screen.getByTestId('substack-card')).toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('returns null when no content is available', async () => {
      mockUseContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: false,
      });
      // API returns null
      mockGetLatestYouTubeVideo.mockResolvedValue(null);
      // Instagram API returns null (inactive so fallback doesn't create a card)
      const { getLatestInstagramPost } =
        await import('../../src/utils/instagram');
      vi.mocked(getLatestInstagramPost).mockResolvedValueOnce({
        active: false,
      });

      await renderAndWait();

      await waitFor(() => {
        // Component returns null, so container should be empty (or have minimal structure)
        expect(screen.queryByTestId('youtube-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('substack-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });
    });

    it('returns null when both sources have invalid dates', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: { ...mockYouTubeVideo, publishDate: 'invalid-date' },
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      mockUseSubstack.mockReturnValue({
        post: { ...mockSubstackPost, pubDate: 'invalid-date' },
        loading: false,
      });
      // API returns null
      mockGetLatestYouTubeVideo.mockResolvedValue(null);

      await renderAndWait();

      await waitFor(() => {
        expect(screen.queryByTestId('youtube-card')).not.toBeInTheDocument();
        expect(screen.queryByTestId('substack-card')).not.toBeInTheDocument();
      });
    });
  });

  describe('Fallback data', () => {
    it('uses fallback YouTube data when Contentful and API fail in DEV mode', async () => {
      // Enable DEV mode for this test
      import.meta.env.DEV = true;

      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: null,
            loading: false,
            error: new Error('API Error'),
          };
        }
        return { data: null, loading: false, error: null };
      });
      mockGetLatestYouTubeVideo.mockResolvedValue(null);
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: false,
      });

      await renderAndWait();

      // Since we mocked fallback as null, we won't see a card
      // But the test verifies the code path doesn't throw
      await waitFor(() => {
        const youtubeCard = screen.queryByTestId('youtube-card');
        // Fallback is mocked to null, so no card should appear
        expect(youtubeCard).not.toBeInTheDocument();
      });
    });
  });

  describe('YouTube API fallback', () => {
    it('fetches from YouTube API when Contentful returns null', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: null,
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        expect(mockGetLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });
    });

    it('fetches from YouTube API when Contentful video is inactive', async () => {
      mockUseContentful.mockImplementation(fn => {
        const fnString = fn.toString();
        if (fnString.includes('getYouTubeVideo')) {
          return {
            data: { ...mockYouTubeVideo, active: false },
            loading: false,
            error: null,
          };
        }
        return { data: null, loading: false, error: null };
      });
      mockUseSubstack.mockReturnValue({
        post: null,
        loading: false,
      });

      await renderAndWait();

      await waitFor(() => {
        expect(mockGetLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });
    });
  });
});
