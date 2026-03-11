import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocationIndicator from '../../src/components/LocationIndicator';

describe('LocationIndicator', () => {
  it('renders system.origin format for matrix theme', () => {
    render(<LocationIndicator theme="matrix" />);
    expect(screen.getByText('system.origin: austin_tx')).toBeInTheDocument();
  });

  it('renders LOC format for catppuccin theme', () => {
    render(<LocationIndicator theme="catppuccin" />);
    expect(screen.getByText('LOC: ATX_USA')).toBeInTheDocument();
  });

  it('renders friendly format with emoji for web2 theme', () => {
    render(<LocationIndicator theme="web2" />);
    expect(screen.getByText('📍 Austin, TX')).toBeInTheDocument();
  });

  it('renders friendly format with emoji for flexoki theme', () => {
    render(<LocationIndicator theme="flexoki" />);
    expect(screen.getByText('📍 Austin, TX')).toBeInTheDocument();
  });

  it('renders default friendly format for unknown themes', () => {
    render(<LocationIndicator theme="unknown" />);
    expect(screen.getByText('📍 Austin, TX')).toBeInTheDocument();
  });

  it('returns null for xmas theme', () => {
    const { container } = render(<LocationIndicator theme="xmas" />);
    expect(container.firstChild).toBeNull();
  });

  it('has correct aria-label for accessibility', () => {
    render(<LocationIndicator theme="web2" />);
    expect(
      screen.getByLabelText('Location: Austin, Texas')
    ).toBeInTheDocument();
  });

  it('applies theme-specific font classes', () => {
    const { container } = render(<LocationIndicator theme="matrix" />);
    const element = container.firstChild;
    expect(element).toHaveClass('font-mono', 'text-xs', 'tracking-wider');
  });

  it('applies theme-specific color classes for catppuccin', () => {
    const { container } = render(<LocationIndicator theme="catppuccin" />);
    const element = container.firstChild;
    expect(element).toHaveClass('text-catppuccin-text/60');
  });

  it('applies theme-specific color classes for web2', () => {
    const { container } = render(<LocationIndicator theme="web2" />);
    const element = container.firstChild;
    expect(element).toHaveClass('text-web2-textLight');
  });

  it('applies transition classes for smooth theme switching', () => {
    const { container } = render(<LocationIndicator theme="flexoki" />);
    const element = container.firstChild;
    expect(element).toHaveClass('transition-all', 'duration-300');
  });
});
