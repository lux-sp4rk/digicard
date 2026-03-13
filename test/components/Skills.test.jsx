import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skills from '../../src/components/Skills';
import { getCardClasses } from '../../src/components/helpers/themeClassHelper';
import * as useContentfulHook from '../../src/hooks/useContentful';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../src/hooks/useContentful', () => ({
  useContentful: vi.fn(),
}));

vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName, size }) => (
    <span data-testid="dynamic-icon" data-icon={iconName} data-size={size}>
      {iconName}
    </span>
  ),
}));

vi.mock('../../src/utils/contentful', () => ({
  getSkills: vi.fn(),
}));

// Mock rich-text renderer so tests don't need Contentful internals
vi.mock('@contentful/rich-text-react-renderer', () => ({
  documentToReactComponents: doc => (
    <span data-testid="rich-text">
      {doc?.content?.[0]?.value ?? 'rich text'}
    </span>
  ),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockLoading = () =>
  useContentfulHook.useContentful.mockReturnValue({
    data: null,
    loading: true,
    error: null,
  });

const mockData = data =>
  useContentfulHook.useContentful.mockReturnValue({
    data,
    loading: false,
    error: null,
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Skills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the section heading', () => {
    mockLoading();
    render(<Skills theme="catppuccin" />);
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockLoading();
    render(<Skills theme="catppuccin" />);
    expect(screen.getByText('Loading skills...')).toBeInTheDocument();
  });

  it('renders fallback skills when CMS returns null', () => {
    mockData(null);
    render(<Skills theme="catppuccin" />);
    expect(screen.getByText('Agentic Workflows')).toBeInTheDocument();
    expect(screen.getByText('Prompt Engineering')).toBeInTheDocument();
    expect(screen.getByText('Full-Stack Development')).toBeInTheDocument();
  });

  it('renders CMS skills when provided', () => {
    const cmsSkills = [
      {
        id: 'cms-1',
        title: 'CMS Skill One',
        subtitle: 'Sub One',
        description: 'Desc one',
        icon: 'FaCode',
        order: 1,
        active: true,
      },
    ];
    mockData(cmsSkills);
    render(<Skills theme="catppuccin" />);
    expect(screen.getByText('CMS Skill One')).toBeInTheDocument();
  });

  it('renders the CTA link', () => {
    mockData(null);
    render(<Skills theme="catppuccin" />);
    const link = screen.getByRole('link', { name: /Let's Talk/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:ulises@luxspark.com');
  });

  // ── Theme helpers ────────────────────────────────────────────────────────

  describe('getCardClasses', () => {
    it('returns catppuccin classes for catppuccin theme', () => {
      expect(getCardClasses('catppuccin')).toContain('bg-catppuccin-surface');
    });
  });
});
