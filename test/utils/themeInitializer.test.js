import { describe, it, expect, vi } from 'vitest';
import { getInitialTheme } from '../../src/utils/themeInitializer';

// Helper to create a mock storage object
const createMockStorage = (initialData = {}) => {
  const store = { ...initialData };
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get store() {
      return store;
    },
  };
};

describe('getInitialTheme', () => {
  describe('when theme is saved in storage', () => {
    it('should return saved theme from storage (non-December)', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });
      const januaryDate = new Date(2024, 0, 15); // Jan 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: januaryDate,
      });

      expect(result).toBe('matrix');
      expect(mockStorage.getItem).toHaveBeenCalledWith('theme');
    });

    it('should force xmas theme during December even if another theme is saved (date takes priority)', () => {
      const mockStorage = createMockStorage({ theme: 'light' });
      const decemberDate = new Date(2024, 11, 15); // Dec 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: decemberDate,
      });

      expect(result).toBe('xmas');
      // Should not save xmas to storage - it's a seasonal override
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      // Saved theme should remain unchanged
      expect(mockStorage.store.theme).toBe('light');
    });

    it('should handle all theme types from storage (non-December)', () => {
      const januaryDate = new Date(2024, 0, 15); // Jan 15 (local)

      // Active themes return as-is
      ['catppuccin', 'flexoki', 'matrix', 'web2', 'xmas'].forEach(theme => {
        const mockStorage = createMockStorage({ theme });
        const result = getInitialTheme({
          storage: mockStorage,
          currentDate: januaryDate,
        });
        expect(result).toBe(theme);
      });

      // Deprecated themes migrate to catppuccin
      ['dark', 'light', 'rosepine'].forEach(theme => {
        const mockStorage = createMockStorage({ theme });
        const result = getInitialTheme({
          storage: mockStorage,
          currentDate: januaryDate,
        });
        expect(result).toBe('catppuccin');
      });
    });
  });

  describe('when no theme is saved in storage', () => {
    it('should return "xmas" in December (month 11) as seasonal override', () => {
      const mockStorage = createMockStorage();
      const decemberDates = [
        new Date(2024, 11, 1), // Dec 1 (local)
        new Date(2024, 11, 15), // Dec 15 (local)
        new Date(2024, 11, 25), // Dec 25 (local)
        new Date(2024, 11, 31), // Dec 31 (local)
      ];

      decemberDates.forEach(date => {
        mockStorage.clear();
        const result = getInitialTheme({
          storage: mockStorage,
          currentDate: date,
        });
        expect(result).toBe('xmas');
        // Should not save xmas to storage - it's a seasonal override
        expect(mockStorage.setItem).not.toHaveBeenCalled();
      });
    });

    it('should return "catppuccin" for non-December months', () => {
      const mockStorage = createMockStorage();
      const nonDecemberMonths = [
        new Date(2024, 0, 15), // January
        new Date(2024, 1, 15), // February
        new Date(2024, 2, 15), // March
        new Date(2024, 3, 15), // April
        new Date(2024, 4, 15), // May
        new Date(2024, 5, 15), // June
        new Date(2024, 6, 15), // July
        new Date(2024, 7, 15), // August
        new Date(2024, 8, 15), // September
        new Date(2024, 9, 15), // October
        new Date(2024, 10, 15), // November
      ];

      nonDecemberMonths.forEach(date => {
        const result = getInitialTheme({
          storage: mockStorage,
          currentDate: date,
        });
        expect(result).toBe('catppuccin');
      });
    });

    it('should return "catppuccin" for November (month 10)', () => {
      const mockStorage = createMockStorage();
      const novemberDate = new Date(2024, 10, 15); // Nov 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: novemberDate,
      });

      expect(result).toBe('catppuccin');
    });

    it('should return "catppuccin" for January (month 0)', () => {
      const mockStorage = createMockStorage();
      const januaryDate = new Date(2024, 0, 15); // Jan 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: januaryDate,
      });

      expect(result).toBe('catppuccin');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string in storage and force xmas during December', () => {
      const mockStorage = createMockStorage({ theme: '' });
      const decemberDate = new Date(2024, 11, 15); // Dec 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: decemberDate,
      });

      // During December, should force xmas (seasonal override)
      expect(result).toBe('xmas');
      // Should not save xmas to storage
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle null in storage and force xmas during December', () => {
      const mockStorage = {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
      };
      const decemberDate = new Date(2024, 11, 15); // Dec 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: decemberDate,
      });

      expect(result).toBe('xmas');
      // Should not save xmas to storage - it's a seasonal override
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle undefined in storage and force xmas during December', () => {
      const mockStorage = {
        getItem: vi.fn(() => undefined),
        setItem: vi.fn(),
      };
      const decemberDate = new Date(2024, 11, 15); // Dec 15 (local)
      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: decemberDate,
      });

      expect(result).toBe('xmas');
      // Should not save xmas to storage - it's a seasonal override
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should use default storage (sessionStorage) when not provided', () => {
      // Mock sessionStorage globally - test with non-December date
      const originalSessionStorage = globalThis.sessionStorage;
      const mockSessionStorage = createMockStorage({ theme: 'web2' });

      Object.defineProperty(globalThis, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
        configurable: true,
      });

      // Mock Date to return a non-December date
      const originalDate = globalThis.Date;
      globalThis.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            super('2024-01-15');
          } else {
            super(...args);
          }
        }
      };

      const result = getInitialTheme();

      expect(result).toBe('web2');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('theme');

      // Restore original
      globalThis.Date = originalDate;
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

      expect(['catppuccin', 'xmas']).toContain(result);
    });

    it('should handle storage that throws errors on getItem gracefully', () => {
      const errorStorage = {
        getItem: vi.fn(() => {
          throw new Error('Storage error');
        }),
        setItem: vi.fn(),
      };
      const januaryDate = new Date(2024, 0, 15); // Jan 15 (local)

      expect(() => {
        getInitialTheme({ storage: errorStorage, currentDate: januaryDate });
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

      // Should return either 'catppuccin' or 'xmas' depending on current month
      expect(['catppuccin', 'xmas']).toContain(result);

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

      // Mock Date to return a non-December date
      const originalDate = globalThis.Date;
      globalThis.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            super('2024-01-15');
          } else {
            super(...args);
          }
        }
      };

      const result = getInitialTheme({});

      expect(result).toBe('matrix');

      // Restore original
      globalThis.Date = originalDate;
      Object.defineProperty(globalThis, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should force xmas theme during December, overriding saved theme (date takes priority)', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });
      const decemberDate = new Date(2024, 11, 15); // Dec 15 (local)

      const result = getInitialTheme({
        storage: mockStorage,
        currentDate: decemberDate,
      });

      expect(result).toBe('xmas');
      // Should not save xmas to storage - it's a seasonal override
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      // Saved theme should remain unchanged
      expect(mockStorage.store.theme).toBe('matrix');
    });

    it('should correctly handle transition from December to January', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });

      // During December, xmas is forced (date takes priority)
      const decemberResult = getInitialTheme({
        storage: mockStorage,
        currentDate: new Date(2024, 11, 31), // Dec 31 (local)
      });

      expect(decemberResult).toBe('xmas');
      // xmas should not be saved to storage
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      // Saved theme should remain unchanged
      expect(mockStorage.store.theme).toBe('matrix');

      // In January, should go back to saved theme (seasonal override ends)
      const januaryResult = getInitialTheme({
        storage: mockStorage,
        currentDate: new Date(2025, 0, 1), // Jan 1 (local)
      });

      expect(januaryResult).toBe('matrix');
    });

    it('should correctly handle transition from November to December', () => {
      const mockStorage = createMockStorage({ theme: 'matrix' });

      // In November, should use saved theme
      const novemberResult = getInitialTheme({
        storage: mockStorage,
        currentDate: new Date(2024, 10, 30), // Nov 30 (local)
      });

      expect(novemberResult).toBe('matrix');
      expect(mockStorage.setItem).not.toHaveBeenCalled();

      // In December, should force xmas (date takes priority, seasonal override)
      const decemberResult = getInitialTheme({
        storage: mockStorage,
        currentDate: new Date(2024, 11, 1), // Dec 1 (local)
      });

      expect(decemberResult).toBe('xmas');
      // Should not save xmas to storage - it's a seasonal override
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      // Saved theme should remain unchanged
      expect(mockStorage.store.theme).toBe('matrix');
    });
  });
});
