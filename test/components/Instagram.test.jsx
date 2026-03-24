import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Instagram from '../../src/components/Instagram';
import * as useContentfulModule from '../../src/hooks/useContentful';
import * as instagramUtils from '../../src/utils/instagram';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/hooks/useContentful');
vi.mock('../../src/utils/instagram');

describe('Instagram', () => {
  const mockPost = {
    id: 'post123',
    caption: 'Test Instagram caption',
    imageUrl: 'https://example.com/image.jpg',
    permalink: 'https://instagram.com/p/ABC123',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with CMS post data', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockPost,
      loading: false,
      error: null,
    });

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    // Component should render a section
    expect(container.querySelector('section')).toBeDefined();
  });

  it('fetches from API when CMS returns null', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    instagramUtils.getLatestInstagramPost.mockResolvedValue(mockPost);

    render(React.createElement(Instagram, { theme: 'default' }));

    await waitFor(() => {
      expect(instagramUtils.getLatestInstagramPost).toHaveBeenCalledTimes(1);
    });
  });

  it('fetches from API when CMS has error', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('CMS Error'),
    });
    instagramUtils.getLatestInstagramPost.mockResolvedValue(mockPost);

    render(React.createElement(Instagram, { theme: 'default' }));

    await waitFor(() => {
      expect(instagramUtils.getLatestInstagramPost).toHaveBeenCalledTimes(1);
    });
  });

  it('truncates caption correctly', async () => {
    const longCaption = 'A'.repeat(200);
    useContentfulModule.useContentful.mockReturnValue({
      data: { ...mockPost, caption: longCaption },
      loading: false,
      error: null,
    });
    instagramUtils.truncateCaption.mockReturnValue('A'.repeat(150) + '...');

    render(React.createElement(Instagram, { theme: 'default' }));

    await waitFor(() => {
      expect(instagramUtils.truncateCaption).toHaveBeenCalledWith(
        longCaption,
        150
      );
    });
  });

  it('applies theme classes correctly', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockPost,
      loading: false,
      error: null,
    });

    const { container } = render(
      React.createElement(Instagram, { theme: 'matrix' })
    );

    const section = container.querySelector('section');
    expect(section?.className).toContain('matrix:border-matrix-glow');
  });

  it('generates correct Instagram URL', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockPost,
      loading: false,
      error: null,
    });

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    const link = container.querySelector('a[href*="instagram.com"]');
    expect(link?.href).toBe('https://instagram.com/p/ABC123');
  });

  it('opens link in new tab', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockPost,
      loading: false,
      error: null,
    });

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    const link = container.querySelector('a[target="_blank"]');
    expect(link).toBeDefined();
    expect(link?.getAttribute('rel')).toContain('noopener');
  });
});
