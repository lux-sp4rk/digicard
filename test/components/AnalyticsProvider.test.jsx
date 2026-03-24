import React from 'react';
import { render } from '@testing-library/react';
import AnalyticsProvider from '../../src/components/AnalyticsProvider';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AnalyticsProvider', () => {
  let consoleLogSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Clean up any existing scripts
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('renders without crashing', () => {
    const { container } = render(React.createElement(AnalyticsProvider));
    expect(container.firstChild).toBeNull();
  });

  it('logs message in DEV mode', () => {
    render(React.createElement(AnalyticsProvider));

    // Should log about analytics being disabled in dev
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Analytics')
    );
  });

  it('renders null (no visible UI)', () => {
    const { container } = render(React.createElement(AnalyticsProvider));
    expect(container.innerHTML).toBe('');
  });
});
