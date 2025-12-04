import { render, screen, waitFor } from '@testing-library/react';
import YouTube from '../../src/components/YouTube';
import * as useContentfulHook from '../../src/hooks/useContentful';
import * as youtubeUtils from '../../src/utils/youtube';

// Mock the useContentful hook
vi.mock('../../src/hooks/useContentful');

// Mock the youtube utility
vi.mock('../../src/utils/youtube');

// Mock DynamicIcon component
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName, className }) => (
    <span data-testid={`icon-${iconName}`} className={className}>
      {iconName}
    </span>
  ),
}));

describe('YouTube', () => {
  const mockContentfulVideo = {
    id: 'contentful-123',
    title: 'Featured Video from Contentful',
    description: 'This is a featured video managed in Contentful',
    url: 'https://www.youtube.com/watch?v=abc123xyz',
    thumbnail: 'https://example.com/custom-thumbnail.jpg',
    duration: '10:30',
    publishDate: '2025-01-15',
    active: true,
  };

  const mockApiVideo = {
    id: 'api-456',
    title: 'Latest Video from YouTube API',
    description: 'This is the latest video fetched from YouTube API',
    url: 'https://www.youtube.com/watch?v=def456uvw',
    thumbnail: 'https://img.youtube.com/vi/def456uvw/maxresdefault.jpg',
    duration: '5:45',
    publishDate: '2025-01-20',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default: Contentful returns video, API not called
    useContentfulHook.useContentful.mockReturnValue({
      data: mockContentfulVideo,
      loading: false,
      error: null,
    });
    youtubeUtils.getLatestYouTubeVideo.mockResolvedValue(mockApiVideo);
  });

  describe('Loading states', () => {
    it('renders loading state when Contentful is loading', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<YouTube theme="dark" />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders loading state when falling back to YouTube API', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      // Make API call hang
      youtubeUtils.getLatestYouTubeVideo.mockImplementation(
        () => new Promise(() => {})
      );

      render(<YouTube theme="dark" />);

      // Should show loading while API fetch is in progress
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });
  });

  describe('Contentful video (featured)', () => {
    it('renders video from Contentful when available and active', () => {
      render(<YouTube theme="dark" />);

      expect(
        screen.getByText('Featured Video from Contentful')
      ).toBeInTheDocument();
      expect(
        screen.getByText('This is a featured video managed in Contentful')
      ).toBeInTheDocument();
      expect(screen.getByText('10:30')).toBeInTheDocument();
    });

    it('does not call YouTube API when Contentful video is active', () => {
      render(<YouTube theme="dark" />);

      expect(youtubeUtils.getLatestYouTubeVideo).not.toHaveBeenCalled();
    });

    it('uses custom thumbnail from Contentful when provided', () => {
      render(<YouTube theme="dark" />);

      const thumbnail = screen.getByAltText('Featured Video from Contentful');
      expect(thumbnail).toHaveAttribute(
        'src',
        'https://example.com/custom-thumbnail.jpg'
      );
    });
  });

  describe('YouTube API fallback', () => {
    it('falls back to YouTube API when Contentful returns null', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(youtubeUtils.getLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Latest Video from YouTube API')
        ).toBeInTheDocument();
      });
    });

    it('falls back to YouTube API when Contentful video is inactive', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: { ...mockContentfulVideo, active: false },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(youtubeUtils.getLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Latest Video from YouTube API')
        ).toBeInTheDocument();
      });
    });

    it('falls back to YouTube API when Contentful errors', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: new Error('Contentful API error'),
      });

      render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(youtubeUtils.getLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Latest Video from YouTube API')
        ).toBeInTheDocument();
      });
    });

    it('only calls YouTube API once even with multiple renders', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      const { rerender } = render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(youtubeUtils.getLatestYouTubeVideo).toHaveBeenCalledTimes(1);
      });

      // Rerender the component
      rerender(<YouTube theme="matrix" />);

      // Should still only have been called once
      expect(youtubeUtils.getLatestYouTubeVideo).toHaveBeenCalledTimes(1);
    });
  });

  describe('No video available', () => {
    it('returns null when no video from either source', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });
      youtubeUtils.getLatestYouTubeVideo.mockResolvedValue(null);

      const { container } = render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });

    it('returns null when API video is inactive', async () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });
      youtubeUtils.getLatestYouTubeVideo.mockResolvedValue({
        ...mockApiVideo,
        active: false,
      });

      const { container } = render(<YouTube theme="dark" />);

      await waitFor(() => {
        expect(container.firstChild).toBeNull();
      });
    });
  });

  describe('Video URL parsing', () => {
    it('extracts video ID from standard YouTube URL', () => {
      render(<YouTube theme="dark" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/abc123xyz'
      );
    });

    it('extracts video ID from youtu.be short URL', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: {
          ...mockContentfulVideo,
          url: 'https://youtu.be/shortid123',
        },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/shortid123'
      );
    });

    it('extracts video ID from YouTube Shorts URL', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: {
          ...mockContentfulVideo,
          url: 'https://www.youtube.com/shorts/shortvideo123',
        },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/shortvideo123'
      );
    });

    it('extracts video ID from embed URL', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: {
          ...mockContentfulVideo,
          url: 'https://www.youtube.com/embed/embedid456',
        },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/embedid456'
      );
    });
  });

  describe('YouTube Shorts handling', () => {
    it('applies correct aspect ratio for YouTube Shorts', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: {
          ...mockContentfulVideo,
          url: 'https://www.youtube.com/shorts/shortvideo123',
        },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      // Check that the container has max-w-sm class for shorts
      const container = document.querySelector('.max-w-sm');
      expect(container).toBeInTheDocument();
    });

    it('applies correct aspect ratio for regular videos', () => {
      render(<YouTube theme="dark" />);

      // Check that the container has max-w-2xl class for regular videos
      const container = document.querySelector('.max-w-2xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Video metadata display', () => {
    it('displays video title', () => {
      render(<YouTube theme="dark" />);
      expect(
        screen.getByText('Featured Video from Contentful')
      ).toBeInTheDocument();
    });

    it('displays video description', () => {
      render(<YouTube theme="dark" />);
      expect(
        screen.getByText('This is a featured video managed in Contentful')
      ).toBeInTheDocument();
    });

    it('displays video duration when provided', () => {
      render(<YouTube theme="dark" />);
      expect(screen.getByText('10:30')).toBeInTheDocument();
    });

    it('does not display duration when not provided', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: { ...mockContentfulVideo, duration: null },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);
      expect(screen.queryByText('10:30')).not.toBeInTheDocument();
    });

    it('displays formatted publish date', () => {
      render(<YouTube theme="dark" />);
      // Date formatting depends on locale, so check that some date is displayed
      const dateElement = screen.getByText(/2025/);
      expect(dateElement).toBeInTheDocument();
    });

    it('generates thumbnail URL when not provided', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: { ...mockContentfulVideo, thumbnail: '' },
        loading: false,
        error: null,
      });

      render(<YouTube theme="dark" />);

      const thumbnail = screen.getByAltText('Featured Video from Contentful');
      expect(thumbnail).toHaveAttribute(
        'src',
        'https://img.youtube.com/vi/abc123xyz/maxresdefault.jpg'
      );
    });
  });

  describe('Links and accessibility', () => {
    it('renders YouTube link with correct href', () => {
      render(<YouTube theme="dark" />);

      const links = screen.getAllByRole('link');
      const youtubeLink = links.find(link =>
        link.getAttribute('href')?.includes('youtube.com/watch')
      );
      expect(youtubeLink).toHaveAttribute(
        'href',
        'https://www.youtube.com/watch?v=abc123xyz'
      );
    });

    it('opens YouTube links in new tab', () => {
      render(<YouTube theme="dark" />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('renders iframe with correct title for accessibility', () => {
      render(<YouTube theme="dark" />);

      const iframe = document.querySelector('iframe');
      expect(iframe).toHaveAttribute('title', 'Featured Video from Contentful');
    });

    it('renders thumbnail with alt text', () => {
      render(<YouTube theme="dark" />);

      const thumbnail = screen.getByAltText('Featured Video from Contentful');
      expect(thumbnail).toBeInTheDocument();
    });
  });

  describe('Theme handling', () => {
    it('renders section heading', () => {
      render(<YouTube theme="dark" />);
      expect(screen.getByText('Youtube')).toBeInTheDocument();
    });

    it('renders YouTube icons', () => {
      render(<YouTube theme="dark" />);
      const icons = screen.getAllByTestId('icon-FaYoutube');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('applies border class for non-web2 themes', () => {
      render(<YouTube theme="dark" />);

      const section = document.querySelector('section');
      expect(section).toHaveClass('border-t');
    });

    it('does not apply border class for web2 theme', () => {
      render(<YouTube theme="web2" />);

      const section = document.querySelector('section');
      expect(section).not.toHaveClass('border-t');
    });
  });
});
