import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ThemeSwitch from '../../src/components/ThemeSwitch';

describe('ThemeSwitch', () => {
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renders with all theme options', () => {
    render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check all options are present
    expect(
      screen.getByRole('option', { name: 'Catppuccin Mocha' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Flexoki Light' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web 2.0' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Matrix' })).toBeInTheDocument();
  });

  it('displays the correct current theme value', () => {
    const { rerender } = render(
      <ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('catppuccin');

    rerender(<ThemeSwitch theme="flexoki" setTheme={mockSetTheme} />);
    expect(select).toHaveValue('flexoki');

    rerender(<ThemeSwitch theme="web2" setTheme={mockSetTheme} />);
    expect(select).toHaveValue('web2');
  });

  it('calls setTheme when a new option is selected', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'flexoki');
    expect(mockSetTheme).toHaveBeenCalledWith('flexoki');

    await user.selectOptions(select, 'web2');
    expect(mockSetTheme).toHaveBeenCalledWith('web2');

    expect(mockSetTheme).toHaveBeenCalledTimes(2);
  });

  it('calls setTheme with correct value using fireEvent', () => {
    render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'flexoki' } });
    expect(mockSetTheme).toHaveBeenCalledWith('flexoki');
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
  });

  describe('theme-specific styling', () => {
    it('applies correct classes for catppuccin theme', () => {
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass(
        'catppuccin:bg-catppuccin-surface',
        'catppuccin:text-catppuccin-text'
      );
    });

    it('applies correct classes for flexoki theme', () => {
      render(<ThemeSwitch theme="flexoki" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass(
        'flexoki:bg-flexoki-surface',
        'flexoki:text-flexoki-text'
      );
    });

    it('applies correct classes for web2 theme', () => {
      render(<ThemeSwitch theme="web2" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass(
        'web2:bg-web2-primaryDark',
        'web2:text-white',
        'web2:border-web2-border',
        'web2:shadow-web2-border',
        'web2:drop-shadow-web2-border'
      );
    });

    it('applies correct classes for matrix theme', () => {
      render(<ThemeSwitch theme="matrix" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass(
        'matrix:bg-matrix-terminal',
        'matrix:border-matrix-glow',
        'matrix:shadow-lg',
        'matrix:shadow-matrix-glow'
      );
    });
  });

  describe('option values and text mapping', () => {
    it('has correct value-to-text mapping', () => {
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const catppuccinOption = screen.getByRole('option', {
        name: 'Catppuccin Mocha',
      });
      expect(catppuccinOption).toHaveValue('catppuccin');

      const flexokiOption = screen.getByRole('option', {
        name: 'Flexoki Light',
      });
      expect(flexokiOption).toHaveValue('flexoki');

      const web2Option = screen.getByRole('option', { name: 'Web 2.0' });
      expect(web2Option).toHaveValue('web2');
    });

    it('has all expected option values', () => {
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const options = screen.getAllByRole('option');
      const values = options.map(option => option.value);

      expect(values).toEqual(['catppuccin', 'flexoki', 'web2', 'matrix']);
      expect(options).toHaveLength(4);
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', () => {
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeVisible();
      expect(select).not.toHaveAttribute('tabindex', '-1');
      expect(select).not.toBeDisabled();
    });

    it('can be focused and navigated with keyboard', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');

      // Focus the select
      await user.click(select);
      expect(select).toHaveFocus();

      // Use keyboard to select a different option
      await user.selectOptions(select, 'flexoki');

      // Should have called setTheme
      expect(mockSetTheme).toHaveBeenCalledWith('flexoki');
    });

    it('has proper semantic role', () => {
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select.tagName).toBe('SELECT');
    });
  });

  describe('edge cases', () => {
    it('handles undefined theme gracefully', () => {
      render(<ThemeSwitch theme={undefined} setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      // When theme is undefined, select shows no selected value, but defaults to first option
      expect(select.value).toBe('catppuccin');
    });

    it('handles null setTheme gracefully', () => {
      // This should not crash
      expect(() => {
        render(<ThemeSwitch theme="catppuccin" setTheme={null} />);
      }).not.toThrow();
    });

    it('handles rapid theme changes', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');

      // Rapidly change themes
      await user.selectOptions(select, 'flexoki');
      await user.selectOptions(select, 'web2');

      expect(mockSetTheme).toHaveBeenCalledTimes(2);
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'flexoki');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'web2');
    });
  });

  describe('integration behavior', () => {
    it('maintains controlled component behavior', () => {
      const { rerender } = render(
        <ThemeSwitch theme="catppuccin" setTheme={mockSetTheme} />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('catppuccin');

      // Simulate parent component updating theme
      rerender(<ThemeSwitch theme="flexoki" setTheme={mockSetTheme} />);
      expect(select).toHaveValue('flexoki');

      rerender(<ThemeSwitch theme="web2" setTheme={mockSetTheme} />);
      expect(select).toHaveValue('web2');
    });

    it('works with different setTheme function instances', () => {
      const setTheme1 = vi.fn();
      const setTheme2 = vi.fn();

      const { rerender } = render(
        <ThemeSwitch theme="catppuccin" setTheme={setTheme1} />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'flexoki' } });

      expect(setTheme1).toHaveBeenCalledWith('flexoki');
      expect(setTheme2).not.toHaveBeenCalled();

      // Change the setTheme function
      rerender(<ThemeSwitch theme="catppuccin" setTheme={setTheme2} />);
      fireEvent.change(select, { target: { value: 'web2' } });

      expect(setTheme2).toHaveBeenCalledWith('web2');
      expect(setTheme1).toHaveBeenCalledTimes(1); // Still only called once
    });
  });
});
