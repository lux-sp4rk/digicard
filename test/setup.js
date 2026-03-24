import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { beforeAll, afterEach, vi } from 'vitest';

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

// Mock localStorage globally
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Cleanup DOM after each test to prevent state leakage between tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
