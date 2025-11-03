import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from '../../src/components/Profile';

// Mock the profile image
vi.mock('../../src/assets/profile.jpg', () => ({
  default: 'profile-image-mock-url',
}));

// Mock the DynamicIcon component
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName }) => <span data-testid="dynamic-icon">{iconName}</span>,
}));

// Mock the ProfileBio component
vi.mock('../../src/components/ProfileBio', () => ({
  BasicBio: ({ theme, bio }) => (
    <div data-testid="basic-bio" data-theme={theme}>
      {bio || 'Default bio'}
    </div>
  ),
}));

describe('Profile', () => {
  it('renders all profile elements for non-web2 themes', () => {
    render(<Profile theme="dark" />);

    // Check for profile image (using alt text for accessibility)
    const img = screen.getByAltText('Profile');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'profile-image-mock-url');

    // Check for location icon (functionality, not specific icon name)
    expect(screen.getByTestId('dynamic-icon')).toBeInTheDocument();

    // Check that BasicBio component is rendered with correct props
    const bio = screen.getByTestId('basic-bio');
    expect(bio).toBeInTheDocument();
    expect(bio).toHaveAttribute('data-theme', 'dark');
    // Verify bio has some content (not empty)
    expect(bio.textContent.length).toBeGreaterThan(0);
  });

  it('conditionally hides profile details for web2 theme', () => {
    render(<Profile theme="web2" />);

    // Profile image should not be rendered for web2 theme
    expect(screen.queryByAltText('Profile')).not.toBeInTheDocument();
  });

  it('renders BasicBio component for all themes with correct theme prop', () => {
    // Test with a non-web2 theme
    const { rerender } = render(<Profile theme="dark" />);
    expect(screen.getByTestId('basic-bio')).toBeInTheDocument();
    expect(screen.getByTestId('basic-bio')).toHaveAttribute(
      'data-theme',
      'dark'
    );

    // Test with web2 theme
    rerender(<Profile theme="web2" />);
    expect(screen.getByTestId('basic-bio')).toBeInTheDocument();
    expect(screen.getByTestId('basic-bio')).toHaveAttribute(
      'data-theme',
      'web2'
    );

    // Test with matrix theme
    rerender(<Profile theme="matrix" />);
    expect(screen.getByTestId('basic-bio')).toBeInTheDocument();
    expect(screen.getByTestId('basic-bio')).toHaveAttribute(
      'data-theme',
      'matrix'
    );
  });

  it('passes bio content to BasicBio component', () => {
    render(<Profile theme="dark" />);

    const bio = screen.getByTestId('basic-bio');
    // Just verify that bio receives some content, not the exact text
    expect(bio.textContent).not.toBe('Default bio');
    expect(bio.textContent.length).toBeGreaterThan(10);
  });
});
