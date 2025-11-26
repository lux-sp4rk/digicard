import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Since ViewSourceButton is not exported separately, we'll test it through the Footer components
import { Footer, SuperFooter } from '../../src/components/Footer';

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

describe('ViewSourceButton', () => {
  describe('in Footer component', () => {
    it('renders with correct text and attributes', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toBeInTheDocument();
      expect(viewSourceButton).toHaveTextContent('View Source');
    });

    it('has correct href attribute', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveAttribute(
        'href',
        'https://github.com/luhsprwhk/digicard'
      );
    });

    it('opens in new tab with security attributes', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveAttribute('target', '_blank');
      expect(viewSourceButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has correct CSS classes', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveClass(
        'text-xs',
        'text-web2-primaryDark',
        'dark:text-blue-400'
      );
    });
  });

  describe('in SuperFooter component', () => {
    it('renders with correct text and attributes', () => {
      render(<SuperFooter />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toBeInTheDocument();
      expect(viewSourceButton).toHaveTextContent('View Source');
    });

    it('has correct href attribute', () => {
      render(<SuperFooter />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveAttribute(
        'href',
        'https://github.com/luhsprwhk/digicard'
      );
    });

    it('opens in new tab with security attributes', () => {
      render(<SuperFooter />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveAttribute('target', '_blank');
      expect(viewSourceButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('has correct CSS classes in SuperFooter context', () => {
      render(<SuperFooter />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveClass(
        'text-xs',
        'text-web2-primaryDark',
        'dark:text-blue-400'
      );
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toBeVisible();
      expect(viewSourceButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('has descriptive text for screen readers', () => {
      render(<Footer theme="dark" />);

      const viewSourceButton = screen.getByRole('link', {
        name: /view source/i,
      });
      expect(viewSourceButton).toHaveAccessibleName('View Source');
    });
  });

  describe('behavior consistency', () => {
    it('renders identically in both Footer and SuperFooter', () => {
      const { container: footerContainer } = render(<Footer theme="dark" />);
      const { container: superFooterContainer } = render(<SuperFooter />);

      const footerButton = footerContainer.querySelector(
        'a[href="https://github.com/luhsprwhk/digicard"]'
      );
      const superFooterButton = superFooterContainer.querySelector(
        'a[href="https://github.com/luhsprwhk/digicard"]'
      );

      expect(footerButton).toHaveTextContent('View Source');
      expect(superFooterButton).toHaveTextContent('View Source');
      expect(footerButton.className).toBe(superFooterButton.className);
      expect(footerButton.getAttribute('target')).toBe(
        superFooterButton.getAttribute('target')
      );
      expect(footerButton.getAttribute('rel')).toBe(
        superFooterButton.getAttribute('rel')
      );
    });
  });
});
