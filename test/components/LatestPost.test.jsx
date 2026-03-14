import { render, screen } from '@testing-library/react';
import LatestPost from '../../src/components/LatestPost';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const useContentfulMock = vi.hoisted(() => vi.fn());
const useSubstackMock = vi.hoisted(() => vi.fn());

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: (...args) => useContentfulMock(...args),
}));
vi.mock('../../src/hooks/useSubstack', () => ({
  useSubstack: () => useSubstackMock(),
}));

vi.mock('../../src/dev-data/featuredPost.json', () => ({
  default: {
    title: 'Fallback Post',
    description: 'Fallback description',
    thumbnail_url: 'https://example.com/fallback.jpg',
    link: 'https://example.com/fallback',
  },
}));

vi.mock('../../src/components/Loading', () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}));

vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName }) => (
    <span data-testid={`icon-${iconName}`}>{iconName}</span>
  ),
}));

describe('LatestPost', () => {
  const mockPost = {
    title: 'Test Post Title',
    description: 'Test post description',
    thumbnail_url: 'https://example.com/thumb.jpg',
    link: 'https://example.com/post',
    web_url: 'https://example.com/post-alt',
    preview_text: 'Preview text',
    image: 'https://example.com/image.jpg',
  };

  beforeEach(() => vi.clearAllMocks());

  it('shows loading when settings is loading', () => {
    useContentfulMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });
    useSubstackMock.mockReturnValue({ post: null, loading: false });
    render(<LatestPost theme="dark" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('shows loading when post is loading', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({ post: null, loading: true });
    render(<LatestPost theme="dark" />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders post from useSubstack in non-web2 theme', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: null },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: mockPost,
      loading: false,
    });
    render(<LatestPost theme="dark" />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('Test post description')).toBeInTheDocument();
    expect(screen.getByAltText('Featured post thumbnail')).toHaveAttribute(
      'src',
      'https://example.com/thumb.jpg'
    );
    expect(screen.getByText('Read More')).toBeInTheDocument();
  });

  it('uses web_url when link is not available', () => {
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: { ...mockPost, link: null },
      loading: false,
    });
    render(<LatestPost theme="dark" />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com/post-alt'
    );
  });

  it('uses preview_text when description is not available', () => {
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: { ...mockPost, description: null },
      loading: false,
    });
    render(<LatestPost theme="dark" />);
    expect(screen.getByText('Preview text')).toBeInTheDocument();
  });

  it('renders web2 layout for web2 theme', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: mockPost,
      loading: false,
    });
    render(<LatestPost theme="web2" />);
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('View Archives')).toBeInTheDocument();
  });

  it('shows blog archive link when configured', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: mockPost,
      loading: false,
    });
    render(<LatestPost theme="web2" />);
    const archiveLink = screen.getByText('View Archives');
    expect(archiveLink).toHaveAttribute('href', 'https://blog.example.com');
  });

  it('returns null when no post in production mode', () => {
    vi.stubEnv('DEV', false);
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({ post: null, loading: false });
    const { container } = render(<LatestPost theme="dark" />);
    expect(container.firstChild).toBeNull();
    vi.unstubAllEnvs();
  });

  it('uses fallback data in DEV mode when no post', () => {
    vi.stubEnv('DEV', true);
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({ post: null, loading: false });
    render(<LatestPost theme="dark" />);
    expect(screen.getByText('Fallback Post')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('returns null for web2 theme when no post in production mode', () => {
    vi.stubEnv('DEV', false);
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({ post: null, loading: false });
    const { container } = render(<LatestPost theme="web2" />);
    expect(container.firstChild).toBeNull();
    vi.unstubAllEnvs();
  });

  it('uses image when thumbnail_url is not available', () => {
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: {
        ...mockPost,
        thumbnail_url: null,
        image: 'https://example.com/backup-image.jpg',
      },
      loading: false,
    });
    render(<LatestPost theme="dark" />);
    expect(screen.getByAltText('Featured post thumbnail')).toHaveAttribute(
      'src',
      'https://example.com/backup-image.jpg'
    );
  });

  it('uses image fallback in web2 theme when thumbnail_url is not available', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: {
        ...mockPost,
        thumbnail_url: null,
        image: 'https://example.com/backup-image.jpg',
      },
      loading: false,
    });
    render(<LatestPost theme="web2" />);
    expect(screen.getByAltText('Featured post thumbnail')).toHaveAttribute(
      'src',
      'https://example.com/backup-image.jpg'
    );
  });

  it('uses web_url when link is not available in web2 theme', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: { ...mockPost, link: null },
      loading: false,
    });
    render(<LatestPost theme="web2" />);
    expect(
      screen.getByRole('link', { name: /test post title/i })
    ).toHaveAttribute('href', 'https://example.com/post-alt');
  });

  it('uses preview_text when description is not available in web2 theme', () => {
    useContentfulMock.mockReturnValue({
      data: { blogArchiveUrl: 'blog.example.com' },
      loading: false,
      error: null,
    });
    useSubstackMock.mockReturnValue({
      post: { ...mockPost, description: null },
      loading: false,
    });
    render(<LatestPost theme="web2" />);
    expect(screen.getByText('Preview text')).toBeInTheDocument();
  });
});
