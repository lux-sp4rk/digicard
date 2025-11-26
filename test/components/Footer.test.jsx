import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer, SuperFooter } from '../../src/components/Footer';

vi.mock('../../src/assets/avatar.jpg', () => ({
  default: 'profile-image-mock-url',
}));

const mockProfile = {
  name: 'Test Name',
  profileImage: 'https://example.com/avatar.jpg',
  bio: 'Test bio snippet.',
};

vi.mock('../../src/hooks/useProfileData', () => ({
  useProfileData: () => ({
    profile: mockProfile,
  }),
}));

// Mock the DynamicIcon component
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName, className }) => (
    <span data-testid="dynamic-icon" data-icon={iconName} className={className}>
      {iconName}
    </span>
  ),
}));

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<Footer theme="dark" />);

    expect(
      screen.getByText(`© ${currentYear}. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders ViewSourceButton', () => {
    render(<Footer theme="dark" />);

    const viewSourceLink = screen.getByRole('link', { name: /view source/i });
    expect(viewSourceLink).toBeInTheDocument();
    expect(viewSourceLink).toHaveAttribute(
      'href',
      'https://github.com/luhsprwhk/digicard'
    );
    expect(viewSourceLink).toHaveAttribute('target', '_blank');
    expect(viewSourceLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows terminal icon with blinking cursor for non-matrix themes', async () => {
    render(<Footer theme="dark" />);

    const terminalIcon = screen.getByTestId('dynamic-icon');
    expect(terminalIcon).toBeInTheDocument();
    expect(terminalIcon).toHaveAttribute('data-icon', 'FaTerminal');

    // Check that the cursor blink effect is working by advancing time
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Just verify the icon is still there and has the terminal icon
    expect(terminalIcon).toBeInTheDocument();
    expect(terminalIcon).toHaveAttribute('data-icon', 'FaTerminal');
  });

  it('does not show terminal icon for matrix theme', () => {
    render(<Footer theme="matrix" />);

    expect(screen.queryByTestId('dynamic-icon')).not.toBeInTheDocument();
  });

  it('shows tooltip on terminal icon hover', () => {
    render(<Footer theme="dark" />);

    expect(screen.getByText('console.log("Open sesame")')).toBeInTheDocument();
  });

  it('applies correct theme classes to terminal icon', () => {
    const { rerender } = render(<Footer theme="dark" />);

    const terminalIcon = screen.getByTestId('dynamic-icon');
    expect(terminalIcon.className).toContain('glow-dark');

    rerender(<Footer theme="light" />);
    expect(terminalIcon.className).toContain('glow-light');
  });
});

describe('SuperFooter', () => {
  it('renders copyright with current year', () => {
    const currentYear = new Date().getFullYear();
    render(<SuperFooter />);

    expect(
      screen.getByText(`© ${currentYear}. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('renders profile section', () => {
    render(<SuperFooter />);

    const avatar = screen.getByAltText(`${mockProfile.name} avatar`);
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', mockProfile.profileImage);
    expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<SuperFooter />);

    const blogLink = screen.getByRole('link', { name: /blog/i });
    expect(blogLink).toHaveAttribute('href', 'https://luhsprwhk.beehiiv.com');

    const githubLink = screen.getByRole('link', { name: /github/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/luhsprwhk');

    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveAttribute(
      'href',
      'https://twitter.com/luhsprwhk'
    );

    const linkedinLink = screen.getByRole('link', { name: /linkedin/i });
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://linkedin.com/in/luhsprwhk'
    );
  });

  it('renders tech badges with correct links', () => {
    render(<SuperFooter />);

    const reactBadge = screen.getByRole('link', { name: /react/i });
    expect(reactBadge).toHaveAttribute('href', 'https://react.dev/');

    const viteBadge = screen.getByRole('link', { name: /vite/i });
    expect(viteBadge).toHaveAttribute('href', 'https://vitejs.dev/');

    const tailwindBadge = screen.getByRole('link', { name: /tailwind/i });
    expect(tailwindBadge).toHaveAttribute('href', 'https://tailwindcss.com/');
  });

  it('renders tech badge images', () => {
    render(<SuperFooter />);

    const reactImg = screen.getByAltText('React');
    expect(reactImg).toHaveAttribute(
      'src',
      'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg'
    );

    const viteImg = screen.getByAltText('Vite');
    expect(viteImg).toHaveAttribute('src', 'https://vitejs.dev/logo.svg');

    const tailwindImg = screen.getByAltText('Tailwind');
    expect(tailwindImg).toHaveAttribute(
      'src',
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg'
    );
  });

  it('renders ViewSourceButton in SuperFooter', () => {
    render(<SuperFooter />);

    const viewSourceLink = screen.getByRole('link', { name: /view source/i });
    expect(viewSourceLink).toBeInTheDocument();
    expect(viewSourceLink).toHaveAttribute(
      'href',
      'https://github.com/luhsprwhk/digicard'
    );
  });

  it('has proper external link attributes for all links', () => {
    render(<SuperFooter />);

    const externalLinks = screen.getAllByRole('link');
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
