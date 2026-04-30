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
    buttonCatppuccin: 'Component__buttonCatppuccin___abcd1',
    buttonFlexoki: 'Component__buttonFlexoki___efgh2',
    cardGithub: 'Component__cardGithub___6k7l8',
    cardDracula: 'Component__cardDracula___9m0n1',
    cardMatrix: 'Component__cardMatrix___2o3p4',
    cardWeb2: 'Component__cardWeb2___5q6r7',
    cardCatppuccin: 'Component__cardCatppuccin___ijkl3',
    cardFlexoki: 'Component__cardFlexoki___mnop4',
  };

  describe('getThemeClass', () => {
    it('should return correct class for catppuccin theme', () => {
      const result = getThemeClass(mockStyles, 'catppuccin', 'button');
      expect(result).toBe('Component__buttonCatppuccin___abcd1');
    });

    it('should return correct class for flexoki theme', () => {
      const result = getThemeClass(mockStyles, 'flexoki', 'button');
      expect(result).toBe('Component__buttonFlexoki___efgh2');
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
      const result = getThemeClass(mockStyles, 'catppuccin', 'card');
      expect(result).toBe('Component__cardCatppuccin___ijkl3');
    });

    it('should default to Github theme suffix for unknown themes', () => {
      const result = getThemeClass(mockStyles, 'unknown-theme', 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should default to Github theme suffix for null theme', () => {
      const result = getThemeClass(mockStyles, null, 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should default to Github theme suffix for undefined theme', () => {
      const result = getThemeClass(mockStyles, undefined, 'button');
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });

    it('should return undefined if styles object does not contain the requested class', () => {
      const result = getThemeClass(mockStyles, 'catppuccin', 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('should handle empty styles object', () => {
      const result = getThemeClass({}, 'catppuccin', 'button');
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
      const result = getThemeClass('catppuccin', 'button');
      expect(result).toBe('Component__buttonCatppuccin___abcd1');
    });

    it('should work with all themes through bound function', () => {
      const getThemeClass = createThemeClassGetter(mockStyles);

      expect(getThemeClass('catppuccin', 'button')).toBe(
        'Component__buttonCatppuccin___abcd1'
      );
      expect(getThemeClass('flexoki', 'button')).toBe(
        'Component__buttonFlexoki___efgh2'
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

      expect(getThemeClass('flexoki', 'card')).toBe(
        'Component__cardFlexoki___mnop4'
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
      expect(getThemeClass('flexoki', 'button')).toBe(
        'Component__buttonFlexoki___efgh2'
      );
      expect(getThemeClass('flexoki', 'button')).toBe(
        'Component__buttonFlexoki___efgh2'
      );
      expect(getThemeClass('matrix', 'card')).toBe(
        'Component__cardMatrix___2o3p4'
      );
    });

    it('should work with empty styles object', () => {
      const getThemeClass = createThemeClassGetter({});
      const result = getThemeClass('flexoki', 'button');
      expect(result).toBeUndefined();
    });
  });

  describe('theme mapping consistency', () => {
    it('should maintain consistent theme mapping across both functions', () => {
      const getThemeClassBound = createThemeClassGetter(mockStyles);

      // Test that both functions return the same results
      expect(getThemeClass(mockStyles, 'catppuccin', 'button')).toBe(
        getThemeClassBound('catppuccin', 'button')
      );

      expect(getThemeClass(mockStyles, 'flexoki', 'button')).toBe(
        getThemeClassBound('flexoki', 'button')
      );

      expect(getThemeClass(mockStyles, 'matrix', 'card')).toBe(
        getThemeClassBound('matrix', 'card')
      );
    });

    it('should handle all supported themes correctly', () => {
      const supportedThemes = ['catppuccin', 'flexoki', 'matrix', 'web2'];
      const expectedSuffixes = ['Catppuccin', 'Flexoki', 'Matrix', 'Web2'];

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
      const result = getThemeClass(mockStyles, 'CATPPUCCIN', 'button');
      // Should default to Github since 'CATPPUCCIN' is not in the theme map
      expect(result).toBe('Component__buttonGithub___1a2b3');
    });
  });
});
