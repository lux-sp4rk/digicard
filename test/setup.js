import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

// Set default environment variables for tests
vi.stubEnv('VITE_CONTENTFUL_SPACE_ID', 'test-space-id');
vi.stubEnv('VITE_CONTENTFUL_ACCESS_TOKEN', 'test-access-token');

// Mock IntersectionObserver
beforeAll(() => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
