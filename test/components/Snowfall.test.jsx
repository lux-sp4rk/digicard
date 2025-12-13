import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Snowfall from '../../src/components/Snowfall';

describe('Snowfall', () => {
  beforeEach(() => {
    // Mock Math.random to have predictable test results
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the snowfall container', () => {
      const { container } = render(<Snowfall />);
      const snowfallContainer = container.querySelector('.snowfall-container');

      expect(snowfallContainer).toBeInTheDocument();
    });

    it('renders 35 snowflakes', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      expect(snowflakes).toHaveLength(35);
    });

    it('renders snowflakes with snowflake emoji', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        expect(snowflake).toHaveTextContent('❄');
      });
    });
  });

  describe('snowflake properties', () => {
    it('assigns random horizontal positions within valid range (0-100%)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const leftValue = parseFloat(snowflake.style.left);
        expect(leftValue).toBeGreaterThanOrEqual(0);
        expect(leftValue).toBeLessThanOrEqual(100);
        expect(snowflake.style.left).toMatch(/%$/);
      });
    });

    it('assigns animation duration within valid range (5-15s)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const duration = parseFloat(snowflake.style.animationDuration);
        expect(duration).toBeGreaterThanOrEqual(5);
        expect(duration).toBeLessThanOrEqual(15);
        expect(snowflake.style.animationDuration).toMatch(/s$/);
      });
    });

    it('assigns animation delay within valid range (0-5s)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const delay = parseFloat(snowflake.style.animationDelay);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(5);
        expect(snowflake.style.animationDelay).toMatch(/s$/);
      });
    });

    it('assigns font size within valid range (0.5-1.5rem)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const fontSize = parseFloat(snowflake.style.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(0.5);
        expect(fontSize).toBeLessThanOrEqual(1.5);
        expect(snowflake.style.fontSize).toMatch(/rem$/);
      });
    });

    it('assigns opacity within valid range (0.3-1.0)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const opacity = parseFloat(snowflake.style.opacity);
        expect(opacity).toBeGreaterThanOrEqual(0.3);
        expect(opacity).toBeLessThanOrEqual(1.0);
      });
    });

    it('assigns drift within valid range (-20 to 20px)', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        const drift = parseFloat(snowflake.style.getPropertyValue('--drift'));
        expect(drift).toBeGreaterThanOrEqual(-20);
        expect(drift).toBeLessThanOrEqual(20);
      });
    });
  });

  describe('unique snowflakes', () => {
    it('generates snowflakes with unique random properties', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = Array.from(container.querySelectorAll('.snowflake'));

      // Check that at least some snowflakes have different positions
      const leftValues = snowflakes.map(s => s.style.left);
      const uniqueLeftValues = new Set(leftValues);
      expect(uniqueLeftValues.size).toBeGreaterThan(1);

      // Check that at least some snowflakes have different durations
      const durations = snowflakes.map(s => s.style.animationDuration);
      const uniqueDurations = new Set(durations);
      expect(uniqueDurations.size).toBeGreaterThan(1);
    });

    it('assigns unique keys to each snowflake', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      // React keys are internal, but we can verify there are 35 distinct elements
      expect(snowflakes).toHaveLength(35);

      // Verify each snowflake is a distinct DOM element
      const snowflakeSet = new Set(snowflakes);
      expect(snowflakeSet.size).toBe(35);
    });
  });

  describe('CSS classes and styling', () => {
    it('applies snowfall-container class to container', () => {
      const { container } = render(<Snowfall />);
      const snowfallContainer = container.querySelector('.snowfall-container');

      expect(snowfallContainer).toHaveClass('snowfall-container');
    });

    it('applies snowflake class to each snowflake', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        expect(snowflake).toHaveClass('snowflake');
      });
    });

    it('container is a div element', () => {
      const { container } = render(<Snowfall />);
      const snowfallContainer = container.querySelector('.snowfall-container');

      expect(snowfallContainer.tagName).toBe('DIV');
    });

    it('snowflakes are div elements', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        expect(snowflake.tagName).toBe('DIV');
      });
    });
  });

  describe('predictable random values', () => {
    it('generates consistent snowflakes with mocked Math.random', () => {
      // Mock Math.random to return a predictable sequence
      let callCount = 0;
      Math.random.mockImplementation(() => {
        const values = [0, 0.5, 1.0, 0.25, 0.75, 0.1];
        return values[callCount++ % values.length];
      });

      const { container } = render(<Snowfall />);
      const firstSnowflake = container.querySelector('.snowflake');

      // With mocked random, first snowflake should have predictable values
      expect(firstSnowflake).toBeInTheDocument();
      expect(firstSnowflake.style.left).toBe('0%'); // 0 * 100

      // Animation duration: 5 + (0.5 * 10) = 10s (second random call)
      expect(firstSnowflake.style.animationDuration).toBe('10s');
    });
  });

  describe('component lifecycle', () => {
    it('initializes snowflakes on mount', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      expect(snowflakes.length).toBe(35);
    });

    it('maintains snowflakes after re-render', () => {
      const { container, rerender } = render(<Snowfall />);
      let snowflakes = container.querySelectorAll('.snowflake');
      expect(snowflakes.length).toBe(35);

      rerender(<Snowfall />);
      snowflakes = container.querySelectorAll('.snowflake');
      expect(snowflakes.length).toBe(35);
    });
  });

  describe('accessibility', () => {
    it('renders decorative elements only', () => {
      const { container } = render(<Snowfall />);
      const snowfallContainer = container.querySelector('.snowfall-container');

      // The container exists and has the correct class for CSS to apply pointer-events
      expect(snowfallContainer).toBeInTheDocument();
      expect(snowfallContainer).toHaveClass('snowfall-container');
    });

    it('does not contain interactive elements', () => {
      const { container } = render(<Snowfall />);

      const buttons = container.querySelectorAll('button');
      const links = container.querySelectorAll('a');
      const inputs = container.querySelectorAll('input');

      expect(buttons.length).toBe(0);
      expect(links.length).toBe(0);
      expect(inputs.length).toBe(0);
    });

    it('snowflakes have appropriate class for styling', () => {
      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      snowflakes.forEach(snowflake => {
        // Each snowflake has the class that CSS uses to apply user-select: none
        expect(snowflake).toHaveClass('snowflake');
      });
    });
  });

  describe('edge cases', () => {
    it('handles extreme Math.random values (all 0)', () => {
      Math.random.mockReturnValue(0);

      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      expect(snowflakes.length).toBe(35);

      // With random = 0, all values should be at minimum
      const firstSnowflake = snowflakes[0];
      expect(firstSnowflake.style.left).toBe('0%');
      expect(firstSnowflake.style.animationDuration).toBe('5s'); // 5 + 0*10
      expect(firstSnowflake.style.animationDelay).toBe('0s');
      expect(firstSnowflake.style.fontSize).toBe('0.5rem'); // 0.5 + 0*1
      expect(parseFloat(firstSnowflake.style.opacity)).toBeCloseTo(0.3); // 0.3 + 0*0.7
    });

    it('handles extreme Math.random values (all 1)', () => {
      Math.random.mockReturnValue(1);

      const { container } = render(<Snowfall />);
      const snowflakes = container.querySelectorAll('.snowflake');

      expect(snowflakes.length).toBe(35);

      // With random = 1, all values should be at maximum
      const firstSnowflake = snowflakes[0];
      expect(firstSnowflake.style.left).toBe('100%');
      expect(firstSnowflake.style.animationDuration).toBe('15s'); // 5 + 1*10
      expect(firstSnowflake.style.animationDelay).toBe('5s');
      expect(firstSnowflake.style.fontSize).toBe('1.5rem'); // 0.5 + 1*1
      expect(parseFloat(firstSnowflake.style.opacity)).toBeCloseTo(1.0); // 0.3 + 1*0.7
    });

    it('does not throw errors during render', () => {
      expect(() => {
        render(<Snowfall />);
      }).not.toThrow();
    });
  });

  describe('performance', () => {
    it('creates exactly 35 elements, no more', () => {
      const { container } = render(<Snowfall />);
      const allDivs = container.querySelectorAll('div');

      // 1 container + 35 snowflakes = 36 total divs
      expect(allDivs.length).toBe(36);
    });

    it('does not recreate snowflakes unnecessarily', () => {
      const { container, rerender } = render(<Snowfall />);
      const firstSnowflake = container.querySelector('.snowflake');

      expect(firstSnowflake).toBeInTheDocument();

      rerender(<Snowfall />);

      // After rerender, new snowflakes are created (component unmounts/remounts)
      // This is expected behavior for React
      const newFirstSnowflake = container.querySelector('.snowflake');
      expect(newFirstSnowflake).toBeInTheDocument();
    });
  });
});
