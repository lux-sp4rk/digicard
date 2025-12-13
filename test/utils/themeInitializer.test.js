import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getInitialTheme } from '../../src/utils/themeInitializer';

// Helper to create a mock storage object
const createMockStorage = (initialData = {}) => {
  const store = { ...initialData };
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get store() {
      return store;
    },
  };
};

describe('getInitialTheme', () => {
  describe('when theme is saved in storage', () => {
    it('should return saved theme from storage', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });
      const result = getInitialTheme({ storage: mockStorage });
      
      expect(result).toBe('matrix');
      expect(mockStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should return saved theme regardless of date', () => {
      const mockStorage = createMockStorage({ theme: 'light' });
      const decemberDate = new Date('2024-12-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: decemberDate 
      });
      
      expect(result).toBe('light');
    });

    it('should handle all theme types from storage', () => {
      const themes = ['dark', 'light', 'matrix', 'web2', 'xmas', 'github'];
      
      themes.forEach((theme) => {
        const mockStorage = createMockStorage({ theme });
        const result = getInitialTheme({ storage: mockStorage });
        expect(result).toBe(theme);
      });
    });
  });

  describe('when no theme is saved in storage', () => {
    it('should return "xmas" in December (month 11)', () => {
      const mockStorage = createMockStorage();
      const decemberDates = [
        new Date('2024-12-01'),
        new Date('2024-12-15'),
        new Date('2024-12-25'),
        new Date('2024-12-31'),
      ];

      decemberDates.forEach((date) => {
        const result = getInitialTheme({ 
          storage: mockStorage, 
          currentDate: date 
        });
        expect(result).toBe('xmas');
      });
    });

    it('should return "dark" for non-December months', () => {
      const mockStorage = createMockStorage();
      const nonDecemberMonths = [
        new Date('2024-01-15'), // January
        new Date('2024-02-15'), // February
        new Date('2024-03-15'), // March
        new Date('2024-04-15'), // April
        new Date('2024-05-15'), // May
        new Date('2024-06-15'), // June
        new Date('2024-07-15'), // July
        new Date('2024-08-15'), // August
        new Date('2024-09-15'), // September
        new Date('2024-10-15'), // October
        new Date('2024-11-15'), // November
      ];

      nonDecemberMonths.forEach((date) => {
        const result = getInitialTheme({ 
          storage: mockStorage, 
          currentDate: date 
        });
        expect(result).toBe('dark');
      });
    });

    it('should return "dark" for November (month 10)', () => {
      const mockStorage = createMockStorage();
      const novemberDate = new Date('2024-11-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: novemberDate 
      });
      
      expect(result).toBe('dark');
    });

    it('should return "dark" for January (month 0)', () => {
      const mockStorage = createMockStorage();
      const januaryDate = new Date('2024-01-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: januaryDate 
      });
      
      expect(result).toBe('dark');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string in storage as no saved theme', () => {
      const mockStorage = createMockStorage({ theme: '' });
      const decemberDate = new Date('2024-12-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: decemberDate 
      });
      
      // Empty string is falsy, so should use date-based logic
      expect(result).toBe('xmas');
    });

    it('should handle null in storage as no saved theme', () => {
      const mockStorage = {
        getItem: vi.fn(() => null),
      };
      const decemberDate = new Date('2024-12-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: decemberDate 
      });
      
      expect(result).toBe('xmas');
    });

    it('should handle undefined in storage as no saved theme', () => {
      const mockStorage = {
        getItem: vi.fn(() => undefined),
      };
      const decemberDate = new Date('2024-12-15');
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: decemberDate 
      });
      
      expect(result).toBe('xmas');
    });

    it('should use default storage (sessionStorage) when not provided', () => {
      // Mock sessionStorage globally
      const originalSessionStorage = globalThis.sessionStorage;
      const mockSessionStorage = createMockStorage({ theme: 'web2' });
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });

      const result = getInitialTheme();
      
      expect(result).toBe('web2');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('theme');

      // Restore original
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it('should use default date (new Date()) when not provided', () => {
      const mockStorage = createMockStorage();
      
      // We can't easily test the exact default date, but we can verify
      // the function doesn't throw and returns a valid theme
      const result = getInitialTheme({ storage: mockStorage });
      
      expect(['dark', 'xmas']).toContain(result);
    });

    it('should handle storage that throws errors gracefully', () => {
      const errorStorage = {
        getItem: vi.fn(() => {
          throw new Error('Storage error');
        }),
      };

      expect(() => {
        getInitialTheme({ storage: errorStorage });
      }).toThrow('Storage error');
    });
  });

  describe('default behavior', () => {
    it('should work with no parameters', () => {
      // Mock sessionStorage to return null (no saved theme)
      const originalSessionStorage = globalThis.sessionStorage;
      const mockSessionStorage = createMockStorage();
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });

      const result = getInitialTheme();
      
      // Should return either 'dark' or 'xmas' depending on current month
      expect(['dark', 'xmas']).toContain(result);

      // Restore original
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });

    it('should work with empty options object', () => {
      const originalSessionStorage = globalThis.sessionStorage;
      const mockSessionStorage = createMockStorage({ theme: 'matrix' });
      
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });

      const result = getInitialTheme({});
      
      expect(result).toBe('matrix');

      // Restore original
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should prioritize saved theme over date-based default', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });
      const decemberDate = new Date('2024-12-15');
      
      const result = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: decemberDate 
      });
      
      expect(result).toBe('matrix');
    });

    it('should correctly handle transition from December to January', () => {
      const mockStorage = createMockStorage();
      
      const decemberResult = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: new Date('2024-12-31') 
      });
      
      const januaryResult = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: new Date('2025-01-01') 
      });
      
      expect(decemberResult).toBe('xmas');
      expect(januaryResult).toBe('dark');
    });

    it('should correctly handle transition from November to December', () => {
      const mockStorage = createMockStorage();
      
      const novemberResult = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: new Date('2024-11-30') 
      });
      
      const decemberResult = getInitialTheme({ 
        storage: mockStorage, 
        currentDate: new Date('2024-12-01') 
      });
      
      expect(novemberResult).toBe('dark');
      expect(decemberResult).toBe('xmas');
    });
  });
});

