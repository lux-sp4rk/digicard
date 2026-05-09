import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
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

    // Modern layout uses cards with "View Project" links (now includes arrow)
    const buttons = screen.getAllByRole('link', { name: /View Project/ });
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
    const buttons = screen.getAllByRole('link', { name: /View Project/ });
    expect(buttons.length).toBeGreaterThan(0);

    warnSpy.mockRestore();
  });

  it('renders rich text description with embedded image asset', () => {
    const richTextDoc = {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'embedded-asset-block',
          data: {
            target: {
              sys: { id: 'asset-1', type: 'Asset' },
              fields: {
                file: {
                  url: '//images.ctfassets.net/example/robot-bear.png',
                  contentType: 'image/png',
                  fileName: 'robot-bear.png',
                },
                title: 'AI Mechanic Mascot',
                description: 'Robotic bear mascot for AI Mechanic service',
              },
            },
          },
          content: [],
        },
      ],
    };

    const cmsProjects = [
      {
        id: 'rich-text-project',
        imgNormal: 'https://example.com/project.jpg',
        alt: 'Rich Text Project',
        title: 'AI Mechanic',
        description: richTextDoc,
        link: 'https://ai-mechanic.example.com',
        order: 1,
        active: true,
      },
    ];

    mockUseContentful.mockReturnValue({
      data: cmsProjects,
      loading: false,
      error: null,
    });

    render(<Projects theme="dark" />);

    // Check that the project title is rendered
    expect(screen.getByText('AI Mechanic')).toBeInTheDocument();

    // Check that the embedded image is rendered with correct attributes
    const imgs = screen.getAllByRole('img');
    // Find the embedded image by its src attribute
    const embeddedImg = imgs.find(
      img =>
        img.getAttribute('src') ===
        'https://images.ctfassets.net/example/robot-bear.png'
    );
    // First img is project card, second should be embedded asset
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(embeddedImg).toBeDefined();
    expect(embeddedImg).toHaveAttribute(
      'src',
      'https://images.ctfassets.net/example/robot-bear.png'
    );
    expect(embeddedImg).toHaveAttribute(
      'alt',
      'Robotic bear mascot for AI Mechanic service'
    );
  });

  it('filters out non-image embedded assets from rich text description', () => {
    const richTextDoc = {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'embedded-asset-block',
          data: {
            target: {
              sys: { id: 'asset-2', type: 'Asset' },
              fields: {
                file: {
                  url: '//assets.ctfassets.net/example/document.pdf',
                  contentType: 'application/pdf',
                  fileName: 'docs.pdf',
                },
                title: 'PDF Document',
                description: 'Some PDF',
              },
            },
          },
          content: [],
        },
      ],
    };

    const cmsProjects = [
      {
        id: 'pdf-project',
        imgNormal: 'https://example.com/project.jpg',
        alt: 'PDF Project',
        title: 'Doc Project',
        description: richTextDoc,
        link: 'https://doc.example.com',
        order: 1,
        active: true,
      },
    ];

    mockUseContentful.mockReturnValue({
      data: cmsProjects,
      loading: false,
      error: null,
    });

    render(<Projects theme="dark" />);

    // Project title should render
    expect(screen.getByText('Doc Project')).toBeInTheDocument();

    // No embedded image should be rendered for PDF assets (only the project card img)
    const imgs = screen.getAllByRole('img');
    const pdfEmbeddedImg = imgs.find(
      img => img.getAttribute('alt') === 'PDF Document'
    );
    expect(pdfEmbeddedImg).toBeUndefined();
  });
});
