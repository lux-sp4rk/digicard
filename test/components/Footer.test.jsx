import React from 'react';
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

  it('shows terminal icon for non-matrix themes', () => {
    render(<Footer theme="dark" />);

    // Footer now has social icons + terminal icon, so use getAllByTestId
    const icons = screen.getAllByTestId('dynamic-icon');
    const terminalIcon = icons.find(
      icon => icon.getAttribute('data-icon') === 'FaTerminal'
    );
    expect(terminalIcon).toBeInTheDocument();
  });

  it('does not show terminal icon for matrix theme', () => {
    render(<Footer theme="matrix" />);

    // Footer has social icons but no terminal icon for matrix theme
    const icons = screen.getAllByTestId('dynamic-icon');
    const terminalIcon = icons.find(
      icon => icon.getAttribute('data-icon') === 'FaTerminal'
    );
    expect(terminalIcon).toBeUndefined();
  });

  it('shows tooltip on terminal icon hover', () => {
    render(<Footer theme="dark" />);

    expect(screen.getByText('console.log("Open sesame")')).toBeInTheDocument();
  });

  it('applies correct classes to terminal icon', () => {
    const { rerender } = render(<Footer theme="dark" />);

    const icons = screen.getAllByTestId('dynamic-icon');
    const terminalIcon = icons.find(
      icon => icon.getAttribute('data-icon') === 'FaTerminal'
    );
    expect(terminalIcon).toBeInTheDocument();
    expect(terminalIcon.className).toContain('inline-block');
    expect(terminalIcon.className).toContain('cursor-pointer');

    rerender(<Footer theme="light" />);
    const updatedIcons = screen.getAllByTestId('dynamic-icon');
    const updatedTerminalIcon = updatedIcons.find(
      icon => icon.getAttribute('data-icon') === 'FaTerminal'
    );
    expect(updatedTerminalIcon.className).toContain('inline-block');
    expect(updatedTerminalIcon.className).toContain('cursor-pointer');
  });
});

describe('SuperFooter', () => {
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

  it('has proper external link attributes for all links', () => {
    render(<SuperFooter />);

    const externalLinks = screen.getAllByRole('link');
    externalLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
