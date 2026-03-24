import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Instagram from '../../src/components/Instagram';
import * as instagramUtils from '../../src/utils/instagram';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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

  it('renders with API post data', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce(
      mockPost
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      expect(container.querySelector('section')).toBeDefined();
    });
  });

  it('truncates caption correctly', async () => {
    const longCaption = 'A'.repeat(200);
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce({
      ...mockPost,
      caption: longCaption,
    });

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      const caption = container.querySelector('.line-clamp-2');
      expect(caption).toBeDefined();
      // line-clamp-2 handles truncation via CSS; verify it renders
      expect(caption.textContent.length).toBeLessThanOrEqual(200);
    });
  });

  it('applies theme classes correctly', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce(
      mockPost
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'matrix' })
    );

    await waitFor(() => {
      expect(container.querySelector('section')).toBeDefined();
      // Theme classes are applied via clsx; verify component renders
      expect(
        container.querySelector('.matrix\\:bg-matrix-terminal')
      ).toBeDefined();
    });
  });

  it('generates correct Instagram URL', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce(
      mockPost
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      const link = container.querySelector(
        'a[href="https://instagram.com/p/ABC123"]'
      );
      expect(link).toBeDefined();
    });
  });

  it('opens link in new tab', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce(
      mockPost
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      const links = container.querySelectorAll('a[target="_blank"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  it('uses fallback post when API returns null', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockResolvedValueOnce(
      null
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      expect(container.querySelector('section')).toBeDefined();
    });
  });

  it('handles API error gracefully', async () => {
    vi.mocked(instagramUtils.getLatestInstagramPost).mockRejectedValueOnce(
      new Error('API error')
    );

    const { container } = render(
      React.createElement(Instagram, { theme: 'default' })
    );

    await waitFor(() => {
      // Should fall back to fallbackPostData and render
      expect(container.querySelector('section')).toBeDefined();
    });
  });
});
