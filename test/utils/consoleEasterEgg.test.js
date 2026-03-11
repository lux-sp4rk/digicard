import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import consoleEasterEgg from '../../src/utils/consoleEasterEgg';

describe('consoleEasterEgg', () => {
  let consoleSpy;
  let mockSetTheme;
  let cleanup;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockSetTheme = vi.fn();
    // Mock window.umami for analytics tracking
    window.umami = { track: vi.fn() };
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    if (cleanup) cleanup();
    delete window.umami;
  });

  it('logs easter egg messages', () => {
    cleanup = consoleEasterEgg(mockSetTheme);
    expect(consoleSpy).toHaveBeenCalled();
    const calls = consoleSpy.mock.calls;
    // Check for "ACCESS GRANTED" message which is part of initial logs
    const hasEasterEgg = calls.some(call =>
      call.some(
        arg => typeof arg === 'string' && arg.includes('ACCESS GRANTED')
      )
    );
    expect(hasEasterEgg).toBe(true);
  });

  it('returns cleanup function', () => {
    cleanup = consoleEasterEgg(mockSetTheme);
    expect(typeof cleanup).toBe('function');
  });
});
