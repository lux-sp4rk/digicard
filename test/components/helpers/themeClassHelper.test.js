import { describe, it, expect } from 'vitest';
import {
  getThemeClass,
  createThemeClassGetter,
} from '../../../src/components/helpers/themeClassHelper';

describe('themeClassHelper', () => {
  // Mock CSS module styles object
  const mockStyles = {
    buttonGithub: 'Component__buttonGithub___1a2b3',
    buttonDracula: 'Component__buttonDracula___4c5d6',
    buttonMatrix: 'Component__buttonMatrix___7e8f9',
    buttonWeb2: 'Component__buttonWeb2___0g1h2',
    cardGithub: 'Component__cardGithub___6k7l8',
    cardDracula: 'Component__cardDracula___9m0n1',
    cardMatrix: 'Component__cardMatrix___2o3p4',
    cardWeb2: 'Component__cardWeb2___5q6r7',
  };

  describe('getThemeClass', () => {
    it('should return correct class for github theme', () => {
      const result = getThemeClass(mockStyles, 'github', 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should return correct class for dark theme (maps to Dracula)', () => {
      const result = getThemeClass(mockStyles, 'dark', 'button');
      expect(result).toBe('Component__buttonDracula___4c5d6');
    });

    it('should return correct class for matrix theme', () => {
      const result = getThemeClass(mockStyles, 'matrix', 'button');
      expect(result).toBe('Component__buttonMatrix___7e8f9');
    });

    it('should return correct class for web2 theme', () => {
      const result = getThemeClass(mockStyles, 'web2', 'button');
      expect(result).toBe('Component__buttonWeb2___0g1h2');
    });

    it('should work with different base class names', () => {
      const result = getThemeClass(mockStyles, 'github', 'card');
      expect(result).toBe('Component__cardGithub___6k7l8');
    });

    it('should default to Github theme for unknown themes', () => {
      const result = getThemeClass(mockStyles, 'unknown-theme', 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should default to Github theme for null theme', () => {
      const result = getThemeClass(mockStyles, null, 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should default to Github theme for undefined theme', () => {
      const result = getThemeClass(mockStyles, undefined, 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should return undefined if styles object does not contain the requested class', () => {
      const result = getThemeClass(mockStyles, 'github', 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should handle empty styles object', () => {
      const result = getThemeClass({}, 'github', 'button');
      expect(result).toBeUndefined();
    });
  });

  describe('createThemeClassGetter', () => {
    it('should return a function', () => {
      const getter = createThemeClassGetter(mockStyles);
      expect(typeof getter).toBe('function');
    });

    it('should create a bound function that works correctly', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);
      const result = getThemeClass('github', 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should work with all themes through bound function', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);

      expect(getThemeClass('github', 'button')).toBe(
        'Component__buttonGithub___1a2b3'
      );
      expect(getThemeClass('dark', 'button')).toBe(
        'Component__buttonDracula___4c5d6'
      );
      expect(getThemeClass('matrix', 'button')).toBe(
        'Component__buttonMatrix___7e8f9'
      );
      expect(getThemeClass('web2', 'button')).toBe(
        'Component__buttonWeb2___0g1h2'
      );
    });

    it('should work with different base classes through bound function', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);

      expect(getThemeClass('github', 'card')).toBe(
        'Component__cardGithub___6k7l8'
      );
      expect(getThemeClass('matrix', 'card')).toBe(
        'Component__cardMatrix___2o3p4'
      );
    });

    it('should handle unknown themes through bound function', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);
      const result = getThemeClass('unknown', 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should maintain styles binding across multiple calls', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);

      // Multiple calls should work consistently
      expect(getThemeClass('github', 'button')).toBe(
        'Component__buttonGithub___1a2b3'
      );
      expect(getThemeClass('github', 'button')).toBe(
        'Component__buttonGithub___1a2b3'
      );
      expect(getThemeClass('matrix', 'card')).toBe(
        'Component__cardMatrix___2o3p4'
      );
    });

    it('should work with empty styles object', () => {
      const getThemeClass = createThemeClassGetter({});
      const result = getThemeClass('github', 'button');
      expect(result).toBeUndefined();
    });
  });

  describe('theme mapping consistency', () => {
    it('should maintain consistent theme mapping across both functions', () => {
      const getThemeClassBound = createThemeClassGetter(mockStyles);

      // Test that both functions return the same results
      expect(getThemeClass(mockStyles, 'github', 'button')).toBe(
        getThemeClassBound('github', 'button')
      );

      expect(getThemeClass(mockStyles, 'dark', 'button')).toBe(
        getThemeClassBound('dark', 'button')
      );

      expect(getThemeClass(mockStyles, 'matrix', 'card')).toBe(
        getThemeClassBound('matrix', 'card')
      );
    });

    it('should handle all supported themes correctly', () => {
      const supportedThemes = ['github', 'dark', 'matrix', 'web2'];
      const expectedSuffixes = ['Github', 'Dracula', 'Matrix', 'Web2'];

      supportedThemes.forEach((theme, index) => {
        const expectedClass = `Component__button${expectedSuffixes[index]}___`;
        const result = getThemeClass(mockStyles, theme, 'button');
        expect(result).toContain(expectedClass);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle numeric base class names', () => {
      const stylesWithNumbers = {
        item1Github: 'Component__item1Github___abc123',
      };
      const result = getThemeClass(stylesWithNumbers, 'github', 'item1');
      expect(result).toBe('Component__item1Github___abc123');
    });

    it('should handle camelCase base class names', () => {
      const stylesWithCamelCase = {
        primaryButtonGithub: 'Component__primaryButtonGithub___def456',
      };
      const result = getThemeClass(
        stylesWithCamelCase,
        'github',
        'primaryButton'
      );
      expect(result).toBe('Component__primaryButtonGithub___def456');
    });

    it('should be case sensitive for theme names', () => {
      const result = getThemeClass(mockStyles, 'GITHUB', 'button');
      // Should default to Github since 'GITHUB' is not in the theme map
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });
  });
});
