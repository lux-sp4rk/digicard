import { render, screen } from '@testing-library/react';
import SoundCloudWidget from '../../src/components/SoundCloudWidget';

const useContentfulMock = vi.hoisted(() => vi.fn());

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: (...args) => useContentfulMock(...args),
}));

// Mock fetch and AbortController globally
const mockFetch = vi.fn();
const mockAbortController = vi.fn();
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
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockAbortController.mockClear();
  });

  it('renders SoundCloud widget when data is loaded', () => {
    // Mock the hook to return loaded data
    useContentfulMock.mockReturnValue({
      data: mockTrack,
      loading: false,
      error: null,
    });

    render(<SoundCloudWidget />);
    // Use querySelector to find iframe since it's not accessible by role
    expect(document.querySelector('iframe')).toBeInTheDocument();
  });

  it('renders loading state when data is loading', () => {
    // Mock the hook to return loading state
    useContentfulMock.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<SoundCloudWidget />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('aborts fetch request when component unmounts during fallback loading', async () => {
    // Mock AbortController instance
    const mockAbortControllerInstance = {
      signal: { aborted: false },
      abort: vi.fn(),
    };
    mockAbortController.mockReturnValue(mockAbortControllerInstance);

    const fetchPromise = new Promise(() => {}); // Never resolves
    mockFetch.mockReturnValue(fetchPromise);

    // Mock the hook to return an error state to trigger fallback
    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Contentful failed'),
    });

    const { unmount } = render(<SoundCloudWidget />);

    // Verify fetch was called with abort signal
    expect(mockFetch).toHaveBeenCalledWith('/soundcloudTrack.json', {
      signal: mockAbortControllerInstance.signal,
    });

    // Unmount the component
    unmount();

    // Verify abort was called
    expect(mockAbortControllerInstance.abort).toHaveBeenCalled();
  });

  it('handles AbortError gracefully and does not update state', async () => {
    const mockAbortControllerInstance = {
      signal: { aborted: false },
      abort: vi.fn(),
    };
    mockAbortController.mockReturnValue(mockAbortControllerInstance);

    // Mock fetch to reject with AbortError
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    useContentfulMock.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Contentful failed'),
    });

    render(<SoundCloudWidget />);

    // Wait for the fetch to be called and rejected
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should still show loading since AbortError doesn't set fallbackLoading to false
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
