import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../../src/components/Profile';
import * as useContentfulHook from '../../src/hooks/useContentful';

// Mock the useContentful hook
vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: vi.fn(),
}));

describe('Profile', () => {
  beforeEach(() => {
    // Default mock: Contentful returns null (falls back to constant)
    useContentfulHook.useContentful.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
  });
  it('renders all profile elements for non-web2 themes', () => {
    const { container } = render(<Profile theme="dark" />);

    // Check for profile image (using alt text for accessibility)
    // Just verify it exists, don't check the exact src path
    const img = screen.getByAltText('Lux Sp4rwhk avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');

    // Check for profile name
    expect(screen.getByText('Lux Sp4rwhk')).toBeInTheDocument();

    // Check that bio is rendered (find by structure - it's a paragraph with font-mono class)
    const bio = container.querySelector('p.font-mono');
    expect(bio).toBeInTheDocument();
    expect(bio.tagName).toBe('P');
    // Verify bio has some content (not empty)
    expect(bio.textContent.length).toBeGreaterThan(0);
  });

  it('conditionally hides profile details for web2 theme', () => {
    render(<Profile theme="web2" />);

    // Profile image should not be rendered for web2 theme
    expect(screen.queryByAltText('Lux Sp4rwhk avatar')).not.toBeInTheDocument();
  });

  it('renders bio for all themes', () => {
    // Test with a non-web2 theme
    const { container, rerender } = render(<Profile theme="dark" />);
    const bioDark = container.querySelector('p.font-mono');
    expect(bioDark).toBeInTheDocument();
    expect(bioDark.tagName).toBe('P');
    expect(bioDark.textContent.length).toBeGreaterThan(0);

    // Test with web2 theme
    rerender(<Profile theme="web2" />);
    const bioWeb2 = container.querySelector('p.font-mono');
    expect(bioWeb2).toBeInTheDocument();
    expect(bioWeb2.tagName).toBe('P');
    expect(bioWeb2.textContent.length).toBeGreaterThan(0);

    // Test with matrix theme
    rerender(<Profile theme="matrix" />);
    const bioMatrix = container.querySelector('p.font-mono');
    expect(bioMatrix).toBeInTheDocument();
    expect(bioMatrix.tagName).toBe('P');
    expect(bioMatrix.textContent.length).toBeGreaterThan(0);
  });

  it('renders bio content correctly', () => {
    const { container } = render(<Profile theme="dark" />);

    const bio = container.querySelector('p.font-mono');
    // Verify bio exists and has content
    expect(bio).toBeInTheDocument();
    expect(bio.textContent.length).toBeGreaterThan(0);
    // Verify bio has expected base styling classes
    expect(bio).toHaveClass('text-lg');
    expect(bio).toHaveClass('font-mono');
    expect(bio).toHaveClass('min-h-[2em]');
    expect(bio).toHaveClass('w-full');
  });
});
