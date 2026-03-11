import { render, screen } from '@testing-library/react';
import Header from '../../src/components/Header';
import { describe, it, expect, vi } from 'vitest';

// Mock ThemeSwitch component
vi.mock('../../src/components/ThemeSwitch', () => ({
  default: ({ theme }) => (
    <div data-testid="theme-switch" data-theme={theme}>
      Theme Switch
    </div>
  ),
}));

describe('Header', () => {
  const mockSetTheme = vi.fn();

  it('renders theme switcher for non-minimal themes', () => {
    const nonMinimalThemes = ['dark', 'catppuccin', 'flexoki', 'web2'];
    nonMinimalThemes.forEach(theme => {
      const { container } = render(
        <Header theme={theme} setTheme={mockSetTheme} />
      );
      expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
      expect(screen.getByText('Site Theme')).toBeInTheDocument();
      container.remove();
    });
  });

  it('hides theme switcher for matrix theme', () => {
    const { container } = render(
      <Header theme="matrix" setTheme={mockSetTheme} />
    );
    expect(screen.queryByTestId('theme-switch')).not.toBeInTheDocument();
    expect(screen.queryByText('Site Theme')).not.toBeInTheDocument();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'justify-end');
  });

  it('hides theme switcher for xmas theme', () => {
    const { container } = render(
      <Header theme="xmas" setTheme={mockSetTheme} />
    );
    expect(screen.queryByTestId('theme-switch')).not.toBeInTheDocument();
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  it('passes theme and setTheme to ThemeSwitch', () => {
    render(<Header theme="catppuccin" setTheme={mockSetTheme} />);
    const switchComponent = screen.getByTestId('theme-switch');
    expect(switchComponent).toHaveAttribute('data-theme', 'catppuccin');
  });
});
