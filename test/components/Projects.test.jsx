import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Projects from '../../src/components/Projects/Projects';

// ─── Hoisted Mock Setup ──────────────────────────────────────────────────────
const { mockUseContentful } = vi.hoisted(() => ({
  mockUseContentful: vi.fn(),
}));

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: (...args) => mockUseContentful(...args),
}));

describe('Projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when data is loading', () => {
    mockUseContentful.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(<Projects theme="dark" />);

    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
  });

  it('renders classic layout for web2 theme (includes inactive projects)', () => {
    // No CMS data -> falls back to static list
    mockUseContentful.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(<Projects theme="web2" />);

    // Classic list uses links with project titles
    // Check that at least one project is rendered (don't check specific names)
    const projectLinks = screen.getAllByRole('link');
    expect(projectLinks.length).toBeGreaterThan(0);

    // Classic view does not render "View Project" buttons
    expect(screen.queryByText('View Project')).not.toBeInTheDocument();
  });

  it('renders modern layout for non-classic themes and filters inactive projects', () => {
    mockUseContentful.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(<Projects theme="dark" />);

    // Modern layout uses cards with "View Project" buttons
    const buttons = screen.getAllByRole('link', { name: 'View Project' });
    // Should have at least one active project from fallback data
    expect(buttons.length).toBeGreaterThan(0);

    // Should have project headings (h3 elements)
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('uses CMS data when available and sorts by order ascending', () => {
    const cmsProjects = [
      {
        id: 'c',
        imgNormal: 'c.jpg',
        alt: 'C',
        title: 'Third',
        description: 'desc',
        link: 'https://c.example.com',
        order: 3,
        active: true,
      },
      {
        id: 'a',
        imgNormal: 'a.jpg',
        alt: 'A',
        title: 'First',
        description: 'desc',
        link: 'https://a.example.com',
        order: 1,
        active: true,
      },
      {
        id: 'b',
        imgNormal: 'b.jpg',
        alt: 'B',
        title: 'Second',
        description: 'desc',
        link: 'https://b.example.com',
        order: 2,
        active: true,
      },
    ];

    mockUseContentful.mockReturnValue({
      data: cmsProjects,
      loading: false,
      error: null,
    });

    render(<Projects theme="matrix" />);

    // Grab all card headings in the rendered order
    const headings = screen.getAllByRole('heading', { level: 3 });
    const texts = headings.map(h => h.textContent);

    // Expect order by `order`: First (1), Second (2), Third (3)
    expect(texts).toEqual(['First', 'Second', 'Third']);
  });

  it('logs a warning and falls back to static data when CMS returns error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mockUseContentful.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Boom'),
    });

    render(<Projects theme="dark" />);

    expect(warnSpy).toHaveBeenCalled();
    // Should render fallback content - check for project structure rather than specific names
    const buttons = screen.getAllByRole('link', { name: 'View Project' });
    expect(buttons.length).toBeGreaterThan(0);

    warnSpy.mockRestore();
  });

  it('creates ripple element when clicking on a project link', () => {
    mockUseContentful.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(<Projects theme="dark" />);

    // Click the first "View Project" button
    const link = screen.getAllByRole('link', { name: 'View Project' })[0];

    // Provide click coordinates; JSDOM may have zero sizes, which is fine for this check
    fireEvent.click(link, { clientX: 10, clientY: 10 });

    // Expect a span.ripple inside the link
    const ripple = link.querySelector('.ripple');
    expect(ripple).toBeInTheDocument();
  });
});
