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
      expect(screen.getByText('Luh Sprwhk')).toBeInTheDocument();
    });

    it('renders all social links for web2 theme', () => {
      render(<NavBar {...defaultProps} theme="web2" />);
      expect(screen.getByTestId('icon-FaRssSquare')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaGithub')).toBeInTheDocument();
    });

    it('shows tooltip on hover for web2 theme', () => {
      render(<NavBar {...defaultProps} theme="web2" />);
      const brand = screen.getByText('Luh Sprwhk');
      fireEvent.mouseEnter(brand);
      const tooltip = screen.getByText(/frontend hides much/i);
      expect(tooltip).toBeInTheDocument();
    });

    it('does not show web2 header for non-web2 themes', () => {
      render(<NavBar {...defaultProps} theme="catppuccin" />);
      expect(screen.queryByText('Luh Sprwhk')).not.toBeInTheDocument();
    });
  });

  describe('Tab Switcher', () => {
    it('renders all three tabs with their icons', () => {
      render(<NavBar {...defaultProps} />);
      expect(screen.getByText('The Work')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaBriefcase')).toBeInTheDocument();
      expect(screen.getByText('Skills')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaRobot')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByTestId('icon-FaUsers')).toBeInTheDocument();
    });

    it('calls setActiveTab when a tab is clicked', () => {
      const setActiveTab = vi.fn();
      render(<NavBar {...defaultProps} setActiveTab={setActiveTab} />);

      fireEvent.click(screen.getByText('Skills'));
      expect(setActiveTab).toHaveBeenCalledWith('skills');

      fireEvent.click(screen.getByText('Services'));
      expect(setActiveTab).toHaveBeenCalledWith('services');
    });

    it('marks the active tab as aria-selected', () => {
      render(<NavBar {...defaultProps} activeTab="skills" />);
      const skillsTab = screen.getByRole('tab', { name: /skills/i });
      const workTab = screen.getByRole('tab', { name: /work/i });

      expect(skillsTab).toHaveAttribute('aria-selected', 'true');
      expect(workTab).toHaveAttribute('aria-selected', 'false');
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
