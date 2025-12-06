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
    render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    // Check all options are present
    expect(screen.getByRole('option', { name: 'Github' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Dracula' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web 2.0' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'CSS Zen' })).toBeInTheDocument();
  });

  it('displays the correct current theme value', () => {
    const { rerender } = render(
      <ThemeSwitch theme="light" setTheme={mockSetTheme} />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('light');

    rerender(<ThemeSwitch theme="dark" setTheme={mockSetTheme} />);
    expect(select).toHaveValue('dark');

    rerender(<ThemeSwitch theme="web2" setTheme={mockSetTheme} />);
    expect(select).toHaveValue('web2');

    rerender(<ThemeSwitch theme="csszen" setTheme={mockSetTheme} />);
    expect(select).toHaveValue('csszen');
  });

  it('calls setTheme when a new option is selected', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');

    await user.selectOptions(select, 'dark');
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    await user.selectOptions(select, 'web2');
    expect(mockSetTheme).toHaveBeenCalledWith('web2');

    await user.selectOptions(select, 'csszen');
    expect(mockSetTheme).toHaveBeenCalledWith('csszen');

    expect(mockSetTheme).toHaveBeenCalledTimes(3);
  });

  it('calls setTheme with correct value using fireEvent', () => {
    render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'dark' } });
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
  });

  describe('theme-specific styling', () => {
    it('applies correct classes for light theme', () => {
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass('bg-white', 'dark:bg-dracula-currentLine');
    });

    it('applies correct classes for dark theme', () => {
      render(<ThemeSwitch theme="dark" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass('dark:bg-dracula-currentLine');
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

    it('applies correct classes for csszen theme', () => {
      render(<ThemeSwitch theme="csszen" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('w-full', 'mt-1', 'px-2', 'py-1', 'rounded');
      expect(select).toHaveClass(
        'csszen:bg-csszen-cream',
        'csszen:text-csszen-text',
        'csszen:border-csszen-text'
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
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const lightOption = screen.getByRole('option', { name: 'Github' });
      expect(lightOption).toHaveValue('light');

      const darkOption = screen.getByRole('option', { name: 'Dracula' });
      expect(darkOption).toHaveValue('dark');

      const web2Option = screen.getByRole('option', { name: 'Web 2.0' });
      expect(web2Option).toHaveValue('web2');

      const csszenOption = screen.getByRole('option', { name: 'CSS Zen' });
      expect(csszenOption).toHaveValue('csszen');
    });

    it('has all expected option values', () => {
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const options = screen.getAllByRole('option');
      const values = options.map(option => option.value);

      expect(values).toEqual(['light', 'dark', 'web2', 'csszen', 'christmas']);
      expect(options).toHaveLength(5);
    });
  });

  describe('accessibility', () => {
    it('is keyboard accessible', () => {
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeVisible();
      expect(select).not.toHaveAttribute('tabindex', '-1');
      expect(select).not.toBeDisabled();
    });

    it('can be focused and navigated with keyboard', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');

      // Focus the select
      await user.click(select);
      expect(select).toHaveFocus();

      // Use keyboard to select a different option
      await user.selectOptions(select, 'dark');

      // Should have called setTheme
      expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('has proper semantic role', () => {
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

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
      expect(select.value).toBe('light');
    });

    it('handles null setTheme gracefully', () => {
      // This should not crash
      expect(() => {
        render(<ThemeSwitch theme="light" setTheme={null} />);
      }).not.toThrow();
    });

    it('handles rapid theme changes', async () => {
      const user = userEvent.setup();
      render(<ThemeSwitch theme="light" setTheme={mockSetTheme} />);

      const select = screen.getByRole('combobox');

      // Rapidly change themes
      await user.selectOptions(select, 'dark');
      await user.selectOptions(select, 'web2');
      await user.selectOptions(select, 'csszen');
      await user.selectOptions(select, 'light');

      expect(mockSetTheme).toHaveBeenCalledTimes(4);
      expect(mockSetTheme).toHaveBeenNthCalledWith(1, 'dark');
      expect(mockSetTheme).toHaveBeenNthCalledWith(2, 'web2');
      expect(mockSetTheme).toHaveBeenNthCalledWith(3, 'csszen');
      expect(mockSetTheme).toHaveBeenNthCalledWith(4, 'light');
    });
  });

  describe('integration behavior', () => {
    it('maintains controlled component behavior', () => {
      const { rerender } = render(
        <ThemeSwitch theme="light" setTheme={mockSetTheme} />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('light');

      // Simulate parent component updating theme
      rerender(<ThemeSwitch theme="dark" setTheme={mockSetTheme} />);
      expect(select).toHaveValue('dark');

      rerender(<ThemeSwitch theme="web2" setTheme={mockSetTheme} />);
      expect(select).toHaveValue('web2');
    });

    it('works with different setTheme function instances', () => {
      const setTheme1 = vi.fn();
      const setTheme2 = vi.fn();

      const { rerender } = render(
        <ThemeSwitch theme="light" setTheme={setTheme1} />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'dark' } });

      expect(setTheme1).toHaveBeenCalledWith('dark');
      expect(setTheme2).not.toHaveBeenCalled();

      // Change the setTheme function
      rerender(<ThemeSwitch theme="light" setTheme={setTheme2} />);
      fireEvent.change(select, { target: { value: 'web2' } });

      expect(setTheme2).toHaveBeenCalledWith('web2');
      expect(setTheme1).toHaveBeenCalledTimes(1); // Still only called once
    });
  });
});
