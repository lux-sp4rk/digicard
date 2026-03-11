import { render, screen, fireEvent } from '@testing-library/react';
import { Web2NavBar } from '../../src/components/NavBar';
import { describe, it, expect, vi } from 'vitest';

// Mock DynamicIcon
vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName }) => (
    <span data-testid={`icon-${iconName}`}>{iconName}</span>
  ),
}));

describe('Web2NavBar', () => {
  it('renders brand name', () => {
    render(<Web2NavBar theme="web2" />);
    expect(screen.getByText('Luh Sprwhk')).toBeInTheDocument();
  });

  it('renders all social links', () => {
    render(<Web2NavBar theme="web2" />);
    expect(screen.getByTestId('icon-FaRssSquare')).toBeInTheDocument();
    expect(screen.getByTestId('icon-FaGithub')).toBeInTheDocument();
    expect(screen.getByTestId('icon-FaTwitter')).toBeInTheDocument();
    expect(screen.getByTestId('icon-FaYoutube')).toBeInTheDocument();
  });

  it('has correct social link URLs', () => {
    render(<Web2NavBar theme="web2" />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://luhsprwhk.beehiiv.com');
    expect(links[1]).toHaveAttribute('href', 'https://github.com/luhsprwhk');
    expect(links[2]).toHaveAttribute('href', 'https://twitter.com/luhsprwhk');
    expect(links[3]).toHaveAttribute('href', 'https://youtube.com/@luhsprwhk');
  });

  it('shows tooltip on hover for web2 theme', () => {
    render(<Web2NavBar theme="web2" />);
    const brand = screen.getByText('Luh Sprwhk');
    fireEvent.mouseEnter(brand);
    const tooltip = screen.getByText(/frontend hides much/i);
    expect(tooltip).toBeInTheDocument();
  });

  it('does not show tooltip for non-web2 themes', () => {
    render(<Web2NavBar theme="dark" />);
    const brand = screen.getByText('Luh Sprwhk');
    fireEvent.mouseEnter(brand);
    expect(screen.queryByText(/frontend hides much/i)).not.toBeInTheDocument();
  });

  it('has web2 theme styling classes', () => {
    const { container } = render(<Web2NavBar theme="web2" />);
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('bg-web2-primaryDark');
  });

  it('brand has pulse animation for web2 theme when not active', () => {
    render(<Web2NavBar theme="web2" />);
    const brand = screen.getByText('Luh Sprwhk');
    expect(brand).toHaveClass('animate-pulse');
  });
});
