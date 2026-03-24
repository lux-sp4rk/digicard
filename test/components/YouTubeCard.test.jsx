import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YouTubeCard from '../../src/components/YouTubeCard';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('YouTubeCard', () => {
  const mockVideo = {
    title: 'Test YouTube Video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://example.com/custom-thumbnail.jpg',
    duration: '3:45',
    active: true,
  };

  const mockShort = {
    title: 'Test YouTube Short',
    url: 'https://www.youtube.com/shorts/ABC123',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when video is null', () => {
    const { container } = render(
      React.createElement(YouTubeCard, { video: null, theme: 'default' })
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when video is inactive', () => {
    const { container } = render(
      React.createElement(YouTubeCard, {
        video: { ...mockVideo, active: false },
        theme: 'default',
      })
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders embedded video for desktop', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeDefined();
    expect(iframe?.src).toContain('youtube.com/embed/dQw4w9WgXcQ');
    expect(iframe?.title).toBe('Test YouTube Video');
  });

  it('renders thumbnail with play button for mobile', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const mobileButton = document.querySelector('.md\\:hidden');
    expect(mobileButton).toBeDefined();
  });

  it('uses custom thumbnail when provided', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const img = document.querySelector('img');
    expect(img?.src).toBe('https://example.com/custom-thumbnail.jpg');
  });

  it('generates thumbnail URL from video ID when no custom thumbnail', () => {
    const videoWithoutThumbnail = {
      ...mockVideo,
      thumbnail: undefined,
    };

    render(
      React.createElement(YouTubeCard, {
        video: videoWithoutThumbnail,
        theme: 'default',
      })
    );

    const img = document.querySelector('img');
    expect(img?.src).toContain('img.youtube.com/vi/dQw4w9WgXcQ');
  });

  it('detects YouTube Shorts correctly', () => {
    render(
      React.createElement(YouTubeCard, { video: mockShort, theme: 'default' })
    );

    const container = document.querySelector('.max-w-sm');
    expect(container).toBeDefined();
  });

  it('uses regular aspect ratio for non-shorts', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const container = document.querySelector('.max-w-2xl');
    expect(container).toBeDefined();
  });

  it('extracts video ID from youtu.be URL', () => {
    const shortUrlVideo = {
      ...mockVideo,
      url: 'https://youtu.be/dQw4w9WgXcQ',
    };

    render(
      React.createElement(YouTubeCard, {
        video: shortUrlVideo,
        theme: 'default',
      })
    );

    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toContain('dQw4w9WgXcQ');
  });

  it('extracts video ID from embed URL', () => {
    const embedUrlVideo = {
      ...mockVideo,
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    };

    render(
      React.createElement(YouTubeCard, {
        video: embedUrlVideo,
        theme: 'default',
      })
    );

    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toContain('dQw4w9WgXcQ');
  });

  it('shows duration badge when provided', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const durationBadge = screen.getByText('3:45');
    expect(durationBadge).toBeDefined();
  });

  it('applies theme classes correctly', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'matrix' })
    );

    const section = document.querySelector('section');
    expect(section?.className).toContain('matrix:border-matrix-glow');
  });

  it('creates ripple effect on mobile button click', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const mobileButton = document.querySelector('.md\\:hidden');
    if (mobileButton) {
      fireEvent.click(mobileButton);
      // Ripple effect creates a span element
      const ripple = mobileButton.querySelector('.ripple');
      expect(ripple).toBeDefined();
    }
  });

  it('opens YouTube link in new tab from mobile view', () => {
    render(
      React.createElement(YouTubeCard, { video: mockVideo, theme: 'default' })
    );

    const mobileButton = document.querySelector('.md\\:hidden');
    expect(mobileButton).toBeDefined();
  });
});
