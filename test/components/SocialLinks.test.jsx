import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocialLinks from '../../src/components/SocialLinks';
import * as useContentfulHook from '../../src/hooks/useContentful';

// Mock the useContentful hook
vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: vi.fn(),
}));

// Mock the DynamicIcon component
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName, size }) => (
    <span data-testid="dynamic-icon" data-icon={iconName} data-size={size}>
      {iconName}
    </span>
  ),
}));

// Mock the MatrixHint component
vi.mock('../../src/components/MatrixHint', () => ({
  default: ({ children }) => <span data-testid="matrix-hint">{children}</span>,
}));

// Mock the contentful utility
vi.mock('../../src/utils/contentful', () => ({
  getSocialLinks: vi.fn(),
}));

describe('SocialLinks', () => {
  const mockSocialLinks = [
    {
      id: '1',
      name: 'GitHub',
      url: 'https://github.com/testuser',
      icon: 'FaGithub',
      order: 1,
      active: true,
      disabled: false,
    },
    {
      id: '2',
      name: 'Twitter',
      url: 'https://twitter.com/testuser',
      icon: 'FaTwitter',
      order: 2,
      active: true,
      disabled: false,
    },
    {
      id: '3',
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/testuser',
      icon: 'FaLinkedin',
      order: 3,
      active: true,
      disabled: false,
    },
    {
      id: '4',
      name: 'Disabled Link',
      url: 'https://example.com',
      icon: 'FaLink',
      order: 4,
      active: true,
      disabled: true,
    },
    {
      id: '5',
      name: 'Inactive Link',
      url: 'https://example.com',
      icon: 'FaLink',
      order: 5,
      active: false,
      disabled: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading and error states', () => {
    it('renders loading state', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      render(<SocialLinks theme="light" />);

      expect(screen.getByText('Loading social links...')).toBeInTheDocument();
    });

    it('renders error state', () => {
      const errorMessage = 'Failed to fetch social links';
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: errorMessage,
      });

      render(<SocialLinks theme="light" />);

      expect(
        screen.getByText(`Error loading social links: ${errorMessage}`)
      ).toBeInTheDocument();
    });

    it('renders nothing when no social links data', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: null,
        loading: false,
        error: null,
      });

      const { container } = render(<SocialLinks theme="light" />);

      expect(container.firstChild).toBeNull();
    });

    it('renders nothing when empty social links array', () => {
      useContentfulHook.useContentful.mockReturnValue({
        data: [],
        loading: false,
        error: null,
      });

      const { container } = render(<SocialLinks theme="light" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('default theme rendering', () => {
    beforeEach(() => {
      useContentfulHook.useContentful.mockReturnValue({
        data: mockSocialLinks,
        loading: false,
        error: null,
      });
    });

    it('renders active and enabled social links only', () => {
      render(<SocialLinks theme="light" />);

      // Should render GitHub, Twitter, LinkedIn (active and not disabled)
      expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /twitter/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /linkedin/i })
      ).toBeInTheDocument();

      // Should not render disabled or inactive links
      expect(screen.queryByText('Disabled Link')).not.toBeInTheDocument();
      expect(screen.queryByText('Inactive Link')).not.toBeInTheDocument();
    });

    it('sorts links by order', () => {
      const unorderedLinks = [
        { ...mockSocialLinks[1], order: 3 }, // Twitter, order 3
        { ...mockSocialLinks[0], order: 1 }, // GitHub, order 1
        { ...mockSocialLinks[2], order: 2 }, // LinkedIn, order 2
      ];

      useContentfulHook.useContentful.mockReturnValue({
        data: unorderedLinks,
        loading: false,
        error: null,
      });

      render(<SocialLinks theme="light" />);

      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveTextContent('GitHub'); // order 1
      expect(links[1]).toHaveTextContent('LinkedIn'); // order 2
      expect(links[2]).toHaveTextContent('Twitter'); // order 3
    });

    it('renders links with correct attributes', () => {
      render(<SocialLinks theme="light" />);

      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/testuser');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
      expect(githubLink).toHaveAttribute('title', 'GitHub');
    });

    it('renders dynamic icons with correct props', () => {
      render(<SocialLinks theme="light" />);

      const icons = screen.getAllByTestId('dynamic-icon');
      expect(icons).toHaveLength(3);

      expect(icons[0]).toHaveAttribute('data-icon', 'FaGithub');
      expect(icons[0]).toHaveAttribute('data-size', '30');

      expect(icons[1]).toHaveAttribute('data-icon', 'FaTwitter');
      expect(icons[2]).toHaveAttribute('data-icon', 'FaLinkedin');
    });

    it('applies correct CSS classes for different themes', () => {
      const { rerender } = render(<SocialLinks theme="light" />);

      let githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'gap-2',
        'p-3',
        'rounded-lg',
        'transition-all',
        'duration-200',
        'sm:flex-1',
        'hover:scale-105',
        'hover:shadow-lg',
        'bg-github-blue',
        'text-white',
        'hover:bg-github-lightBlue'
      );

      rerender(<SocialLinks theme="dark" />);
      githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveClass(
        'dark:bg-dracula-comment',
        'dark:hover:bg-dracula-purple'
      );

      rerender(<SocialLinks theme="matrix" />);
      githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveClass(
        'matrix:bg-matrix-terminal',
        'matrix:text-matrix-highlight',
        'matrix:border',
        'matrix:border-matrix-glow'
      );

      rerender(<SocialLinks theme="web2" />);
      githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveClass(
        'web2:bg-web2-primary',
        'web2:text-white',
        'web2:hover:bg-web2-secondary'
      );
    });
  });

  describe('CSS Zen theme rendering', () => {
    beforeEach(() => {
      useContentfulHook.useContentful.mockReturnValue({
        data: mockSocialLinks,
        loading: false,
        error: null,
      });
    });

    it('renders CSSZenLinks component for csszen theme', () => {
      render(<SocialLinks theme="csszen" />);

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();
      expect(aside).toHaveClass('csszen-links-sidebar');

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Connect & Follow');
      expect(screen.getByTestId('matrix-hint')).toHaveTextContent('C');
    });

    it('renders links in navigation list for csszen theme', () => {
      render(<SocialLinks theme="csszen" />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(3); // Only active, non-disabled links
    });

    it('applies special animation for links starting with C in csszen theme', () => {
      const linksWithC = [
        {
          id: '1',
          name: 'Codepen',
          url: 'https://codepen.io/testuser',
          icon: 'FaCodepen',
          order: 1,
          active: true,
          disabled: false,
        },
        {
          id: '2',
          name: 'GitHub',
          url: 'https://github.com/testuser',
          icon: 'FaGithub',
          order: 2,
          active: true,
          disabled: false,
        },
      ];

      useContentfulHook.useContentful.mockReturnValue({
        data: linksWithC,
        loading: false,
        error: null,
      });

      render(<SocialLinks theme="csszen" />);

      const codepenLink = screen.getByRole('link', { name: /codepen/i });
      expect(codepenLink).toHaveClass(
        'inline-block',
        'animate-pulse',
        'hover:animate-bounce',
        'transition-all',
        'duration-300',
        'cursor-pointer'
      );

      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).not.toHaveClass('animate-pulse');
    });

    it('applies correct csszen styling classes', () => {
      render(<SocialLinks theme="csszen" />);

      const aside = screen.getByRole('complementary');
      expect(aside).toHaveClass(
        'p-4',
        'bg-[#fffbe6]',
        'border-l',
        'border-[#b6a16b]',
        'rounded-xl',
        'shadow-md',
        'flex',
        'flex-col',
        'items-end'
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveClass(
          'text-[#b6a16b]',
          'underline',
          'hover:text-[#8b7c4a]',
          'transition-colors',
          'text-base'
        );
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('excludes disabled and inactive links in csszen theme', () => {
      const csszenLinks = [
        {
          id: '1',
          name: 'GitHub',
          url: 'https://github.com/testuser',
          icon: 'FaGithub',
          order: 1,
          active: true,
          disabled: false,
        },
        {
          id: '2',
          name: 'Disabled Link',
          url: 'https://example.com',
          icon: 'FaLink',
          order: 2,
          active: true,
          disabled: true,
        },
        {
          id: '3',
          name: 'Inactive Link',
          url: 'https://example.com',
          icon: 'FaLink',
          order: 3,
          active: false,
          disabled: false,
        },
      ];

      useContentfulHook.useContentful.mockReturnValue({
        data: csszenLinks,
        loading: false,
        error: null,
      });

      render(<SocialLinks theme="csszen" />);

      // Should render only GitHub (active and not disabled)
      expect(screen.getByText('GitHub')).toBeInTheDocument();

      // Should not render disabled or inactive links
      expect(screen.queryByText('Disabled Link')).not.toBeInTheDocument();
      expect(screen.queryByText('Inactive Link')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      useContentfulHook.useContentful.mockReturnValue({
        data: mockSocialLinks,
        loading: false,
        error: null,
      });
    });

    it('has proper semantic structure for default theme', () => {
      const { container } = render(<SocialLinks theme="light" />);

      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('has proper semantic structure for csszen theme', () => {
      render(<SocialLinks theme="csszen" />);

      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('all links are keyboard accessible', () => {
      render(<SocialLinks theme="light" />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toBeVisible();
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('links have descriptive titles', () => {
      render(<SocialLinks theme="light" />);

      expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute(
        'title',
        'GitHub'
      );
      expect(screen.getByRole('link', { name: /twitter/i })).toHaveAttribute(
        'title',
        'Twitter'
      );
      expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
        'title',
        'LinkedIn'
      );
    });
  });

  describe('edge cases', () => {
    it('handles links with missing properties gracefully', () => {
      const incompleteLinks = [
        {
          id: '1',
          name: 'GitHub',
          url: 'https://github.com/testuser',
          // missing icon
          order: 1,
          active: true,
          disabled: false,
        },
        {
          id: '2',
          // missing name
          url: 'https://twitter.com/testuser',
          icon: 'FaTwitter',
          order: 2,
          active: true,
          disabled: false,
        },
      ];

      useContentfulHook.useContentful.mockReturnValue({
        data: incompleteLinks,
        loading: false,
        error: null,
      });

      expect(() => {
        render(<SocialLinks theme="light" />);
      }).not.toThrow();
    });

    it('handles empty order values', () => {
      const unorderedLinks = [
        {
          id: '1',
          name: 'GitHub',
          url: 'https://github.com/testuser',
          icon: 'FaGithub',
          // order: undefined
          active: true,
          disabled: false,
        },
      ];

      useContentfulHook.useContentful.mockReturnValue({
        data: unorderedLinks,
        loading: false,
        error: null,
      });

      expect(() => {
        render(<SocialLinks theme="light" />);
      }).not.toThrow();
    });
  });
});
