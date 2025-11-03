import React from 'react';
import { render, screen } from '@testing-library/react';
import { BasicBio } from '../../src/components/ProfileBio';

describe('ProfileBio', () => {
  describe('BasicBio', () => {
    const customBio = 'This is a custom bio for testing';

    it('renders without crashing', () => {
      const { container } = render(<BasicBio theme="dark" />);
      // Check that a paragraph element is rendered
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('renders bio content when provided', () => {
      render(<BasicBio theme="dark" bio={customBio} />);
      expect(screen.getByText(customBio)).toBeInTheDocument();
    });

    it('custom bio prop overrides default behavior', () => {
      const { container } = render(<BasicBio theme="matrix" bio={customBio} />);
      const bioElement = container.querySelector('p');

      // Verify custom bio is used
      expect(bioElement).toHaveTextContent(customBio);
    });

    it('renders bio for different themes', () => {
      const themes = ['dark', 'web2', 'matrix', 'brutalist'];

      themes.forEach(theme => {
        const { container } = render(
          <BasicBio theme={theme} bio={customBio} />
        );
        const bioElement = container.querySelector('p');

        // Verify bio is rendered for each theme
        expect(bioElement).toBeInTheDocument();
        expect(bioElement).toHaveTextContent(customBio);
      });
    });

    it('applies base CSS classes', () => {
      const { container } = render(<BasicBio theme="dark" bio={customBio} />);
      const bioElement = container.querySelector('p');

      // Check for base styling classes
      expect(bioElement).toHaveClass('text-lg');
      expect(bioElement).toHaveClass('font-mono');
      expect(bioElement).toHaveClass('min-h-[2em]');
    });

    it('applies theme-specific CSS classes', () => {
      // Test web2 theme classes
      const { container: web2Container } = render(
        <BasicBio theme="web2" bio={customBio} />
      );
      const web2Element = web2Container.querySelector('p');
      expect(web2Element).toHaveClass('web2:text-4xl');
      expect(web2Element).toHaveClass('web2:text-web2-secondary');
      expect(web2Element).toHaveClass('web2:font-web2Heading');

      // Test matrix theme classes
      const { container: matrixContainer } = render(
        <BasicBio theme="matrix" bio={customBio} />
      );
      const matrixElement = matrixContainer.querySelector('p');
      expect(matrixElement).toHaveClass('matrix:text-matrix-glow');
    });

    it('renders matrix-specific content when no custom bio provided', () => {
      const { container } = render(<BasicBio theme="matrix" />);
      const bioElement = container.querySelector('p');

      // Should have some content (not testing exact text)
      expect(bioElement.textContent).toBeTruthy();
      expect(bioElement.textContent.length).toBeGreaterThan(0);
    });
  });
});
