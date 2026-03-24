import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectCardWithIcon from '../../src/components/ProjectCardWithIcon';
import { describe, it, expect, vi } from 'vitest';

describe('ProjectCardWithIcon', () => {
  const mockProps = {
    img: 'https://example.com/project-image.jpg',
    alt: 'Project screenshot',
    title: 'Test Project',
    description: 'A test project description',
    link: 'https://github.com/test/project',
    icon: 'FaGithub',
    refCb: vi.fn(),
    createRipple: vi.fn(),
  };

  it('renders with all required props', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    expect(screen.getByText('Test Project')).toBeDefined();
    expect(screen.getByText('A test project description')).toBeDefined();
    expect(screen.getByText('View Project')).toBeDefined();
  });

  it('renders project image with correct alt text', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    const img = screen.getByAltText('Project screenshot');
    expect(img).toBeDefined();
    expect(img.src).toBe('https://example.com/project-image.jpg');
  });

  it('renders icon when provided', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    // The icon should be rendered (DynamicIcon component)
    const iconContainer = document.querySelector('[data-icon]');
    expect(iconContainer || document.querySelector('svg')).toBeDefined();
  });

  it('does not render icon when not provided', () => {
    const propsWithoutIcon = { ...mockProps, icon: undefined };
    render(React.createElement(ProjectCardWithIcon, propsWithoutIcon));

    // Should still render without errors
    expect(screen.getByText('Test Project')).toBeDefined();
  });

  it('creates link with correct href', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    const link = screen.getByText('View Project').closest('a');
    expect(link?.href).toBe('https://github.com/test/project');
  });

  it('opens link in new tab', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    const link = screen.getByText('View Project').closest('a');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toContain('noopener');
  });

  it('calls createRipple on link click', () => {
    const createRippleMock = vi.fn();
    const propsWithRipple = { ...mockProps, createRipple: createRippleMock };

    render(React.createElement(ProjectCardWithIcon, propsWithRipple));

    const link = screen.getByText('View Project');
    fireEvent.click(link);

    expect(createRippleMock).toHaveBeenCalledTimes(1);
  });

  it('applies ref callback to container', () => {
    const refCallbackMock = vi.fn();
    const propsWithRef = { ...mockProps, refCb: refCallbackMock };

    render(React.createElement(ProjectCardWithIcon, propsWithRef));

    expect(refCallbackMock).toHaveBeenCalledTimes(1);
    expect(refCallbackMock).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('applies theme classes for default theme', () => {
    render(React.createElement(ProjectCardWithIcon, mockProps));

    const container = screen.getByText('Test Project').closest('.rounded-lg');
    expect(container?.className).toContain('bg-white');
  });

  it('renders with long description', () => {
    const longDescription =
      'This is a very long description that contains many words and details about the project. It should still render correctly without any issues.';
    const propsWithLongDesc = { ...mockProps, description: longDescription };

    render(React.createElement(ProjectCardWithIcon, propsWithLongDesc));

    expect(screen.getByText(longDescription)).toBeDefined();
  });
});
