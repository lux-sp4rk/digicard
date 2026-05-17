import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../../src/components/NavBar';
import { describe, it, expect, vi } from 'vitest';

// Mock DynamicIcon
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName }) => (
    <span data-testid={`icon-${iconName}`}>{iconName}</span>
  ),
}));

describe('NavBar', () => {
  const defaultProps = {
    theme: 'catppuccin',
    activeTab: 'work',
    setActiveTab: vi.fn(),
  };

  describe('Web2 specific features', () => {
    it('renders brand name for web2 theme', () => {
      render(<NavBar {...defaultProps} theme="web2" />);
      expect(screen.getByText('Lux Sp4rk')).toBeInTheDocument();
    });

    it('renders all social links for web2 theme', () => {
      render(<NavBar {...defaultProps} theme="web2" />);
      expect(screen.getByTestId('icon-FaRssSquare')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaGithub')).toBeInTheDocument();
    });

    it('does not show web2 header for non-web2 themes', () => {
      render(<NavBar {...defaultProps} theme="catppuccin" />);
      expect(screen.queryByText('Lux Sp4rk')).not.toBeInTheDocument();
    });
  });

  describe('Tab Switcher', () => {
    it('renders all two tabs with their icons', () => {
      render(<NavBar {...defaultProps} />);
      expect(screen.getByText('The Work')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaBriefcase')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaUsers')).toBeInTheDocument();
    });

    it('calls setActiveTab when a tab is clicked', () => {
      const setActiveTab = vi.fn();
      render(<NavBar {...defaultProps} setActiveTab={setActiveTab} />);

      fireEvent.click(screen.getByText('Services'));
      expect(setActiveTab).toHaveBeenCalledWith('services');
    });

    it('applies correct theme classes for active tab (catppuccin)', () => {
      render(<NavBar {...defaultProps} theme="catppuccin" activeTab="work" />);
      const workTab = screen.getByRole('tab', { name: /work/i });
      expect(workTab).toHaveClass('text-catppuccin-blue');
    });

    it('applies correct theme classes for active tab (matrix)', () => {
      render(<NavBar {...defaultProps} theme="matrix" activeTab="work" />);
      const workTab = screen.getByRole('tab', { name: /work/i });
      expect(workTab).toHaveClass('text-matrix-glow');
    });
  });
});
