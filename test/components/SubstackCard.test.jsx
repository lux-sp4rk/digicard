import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SubstackCard from '../../src/components/SubstackCard';
import * as useContentfulModule from '../../src/hooks/useContentful';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/hooks/useContentful');

describe('SubstackCard', () => {
  const mockPost = {
    title: 'Test Substack Post',
    description: 'Test description',
    link: 'https://test.substack.com/p/test',
    thumbnail_url: 'https://example.com/thumbnail.jpg',
    pubDate: '2025-01-15T10:00:00Z',
  };

  const mockSettings = {
    blogArchiveUrl: 'test.substack.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading when settings are loading', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'default' })
    );

    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('returns null when post is null', () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    const { container } = render(
      React.createElement(SubstackCard, { post: null, theme: 'default' })
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders post with RSS format data', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'default' })
    );

    await waitFor(() => {
      expect(screen.getByText('Test Substack Post')).toBeDefined();
    });

    expect(screen.getByText('Test description')).toBeDefined();
    expect(screen.getByText('Read More')).toBeDefined();
  });

  it('renders post with normalized format data', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    const normalizedPost = {
      title: 'Normalized Post',
      preview_text: 'Normalized description',
      web_url: 'https://test.substack.com/p/normalized',
      image: 'https://example.com/normalized.jpg',
      publishDate: '2025-01-20T10:00:00Z',
    };

    render(
      React.createElement(SubstackCard, {
        post: normalizedPost,
        theme: 'default',
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Normalized Post')).toBeDefined();
    });

    expect(screen.getByText('Normalized description')).toBeDefined();
  });

  it('renders web2 theme (ClassicSubstackCard)', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'web2' })
    );

    await waitFor(() => {
      expect(screen.getByText('Test Substack Post')).toBeDefined();
    });

    expect(screen.getByText('View Archives')).toBeDefined();
  });

  it('renders default theme when not web2', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'matrix' })
    );

    await waitFor(() => {
      expect(screen.getByText('Test Substack Post')).toBeDefined();
    });

    expect(screen.getByText('Read More')).toBeDefined();
  });

  it('opens post link in new tab', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'default' })
    );

    await waitFor(() => {
      const link = screen.getByText('Test Substack Post').closest('a');
      expect(link?.target).toBe('_blank');
      expect(link?.rel).toContain('noopener');
    });
  });

  it('does not show View Archives when blogArchiveUrl is missing', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: {}, // No blogArchiveUrl
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'web2' })
    );

    await waitFor(() => {
      expect(screen.getByText('Test Substack Post')).toBeDefined();
    });

    expect(screen.queryByText('View Archives')).toBeNull();
  });

  it('uses correct archive URL format', async () => {
    useContentfulModule.useContentful.mockReturnValue({
      data: mockSettings,
      loading: false,
      error: null,
    });

    render(
      React.createElement(SubstackCard, { post: mockPost, theme: 'web2' })
    );

    await waitFor(() => {
      const archiveLink = screen.getByText('View Archives');
      expect(archiveLink.closest('a')?.href).toBe('https://test.substack.com/');
    });
  });
});
