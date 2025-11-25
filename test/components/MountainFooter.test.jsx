import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MountainFooter from '../../src/components/MountainFooter';

// Mock the SuperFooter component
vi.mock('../../src/components/Footer', () => ({
  SuperFooter: () => <div data-testid="super-footer">SuperFooter Content</div>,
}));

// Mock the profile image
vi.mock('../../src/assets/lux-avatar.jpg', () => ({
  default: 'profile-image-mock-url',
}));

describe('MountainFooter', () => {
  it('renders the SVG mountain illustration', () => {
    const { container } = render(<MountainFooter />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 1200 200');
    expect(svg).toHaveAttribute('preserveAspectRatio', 'none');
  });

  it('renders three mountain layers with correct fill colors', () => {
    const { container } = render(<MountainFooter />);

    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(3);

    // Cloud layer
    expect(paths[0]).toHaveAttribute('fill', '#F0F8FF');

    // Mountain layer 1
    expect(paths[1]).toHaveAttribute('fill', '#E6F3FF');

    // Mountain layer 2
    expect(paths[2]).toHaveAttribute('fill', '#FFFFFF');
  });

  it('renders the SuperFooter component', () => {
    render(<MountainFooter />);

    expect(screen.getByTestId('super-footer')).toBeInTheDocument();
    expect(screen.getByText('SuperFooter Content')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-mountain-footer';
    const { container } = render(<MountainFooter className={customClass} />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(customClass);
    expect(wrapper).toHaveClass('relative', 'w-full');
  });

  it('applies default classes when no className provided', () => {
    const { container } = render(<MountainFooter />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('relative', 'w-full');
    expect(wrapper.className).toBe('relative w-full ');
  });

  it('has proper structure with SVG and content sections', () => {
    const { container } = render(<MountainFooter />);

    // Should have the main wrapper div
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('relative', 'w-full');

    // Should have SVG element
    const svg = wrapper.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-full', 'h-auto');

    // Should have content section with SuperFooter
    const contentSection = wrapper.querySelector('.bg-white');
    expect(contentSection).toBeInTheDocument();
    expect(contentSection).toHaveClass('bg-white', 'py-8', 'px-4');
  });

  it('has correct SVG mountain path definitions', () => {
    const { container } = render(<MountainFooter />);

    const paths = container.querySelectorAll('path');

    // Check that paths have the correct d attributes (mountain shapes)
    expect(paths[0]).toHaveAttribute(
      'd',
      'M0,100 C100,120 200,80 300,90 C400,100 500,140 600,130 C700,120 800,60 900,70 C1000,80 1100,120 1200,110 L1200,200 L0,200 Z'
    );
    expect(paths[1]).toHaveAttribute(
      'd',
      'M0,140 L200,90 L350,130 L450,80 L580,120 L750,70 L900,120 L1050,80 L1200,110 L1200,200 L0,200 Z'
    );
    expect(paths[2]).toHaveAttribute(
      'd',
      'M0,160 L150,130 L300,150 L450,120 L600,160 L750,130 L900,160 L1050,120 L1200,140 L1200,200 L0,200 Z'
    );
  });
});
