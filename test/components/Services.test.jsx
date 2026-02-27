import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Services from '../../src/components/Services';
import {
  getCardClasses,
  getIconClasses,
  getCtaBorderClasses,
  getCtaButtonClasses,
} from '../../src/components/helpers/themeClassHelper';
import * as useContentfulHook from '../../src/hooks/useContentful';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('../../src/hooks/useContentful');

vi.mock('../../src/components/DynamicIcon', () => ({
  default: ({ iconName, size }) => (
    <span data-testid="dynamic-icon" data-icon={iconName} data-size={size}>
      {iconName}
    </span>
  ),
}));

vi.mock('../../src/utils/contentful', () => ({
  getServices: vi.fn(),
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

const mockError = err =>
  useContentfulHook.useContentful.mockReturnValue({
    data: null,
    loading: false,
    error: err,
  });

const mockData = data =>
  useContentfulHook.useContentful.mockReturnValue({
    data,
    loading: false,
    error: null,
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading & error states ──────────────────────────────────────────────

  it('renders the section heading', () => {
    mockLoading();
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    mockLoading();
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('Loading services...')).toBeInTheDocument();
  });

  it('logs warning and shows fallback data on Contentful error', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockError(new Error('Contentful down'));

    render(<Services theme="catppuccin" />);

    expect(warnSpy).toHaveBeenCalled();
    // Fallback services should be visible
    expect(screen.getByText('The Sovereign Protocol')).toBeInTheDocument();
    warnSpy.mockRestore();
  });

  // ── Fallback data ───────────────────────────────────────────────────────

  it('renders fallback services when CMS returns null', () => {
    mockData(null);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('The Sovereign Protocol')).toBeInTheDocument();
    expect(screen.getByText('Dev-Partner Coaching')).toBeInTheDocument();
    expect(screen.getByText('Agentic Product Rescue')).toBeInTheDocument();
  });

  it('renders fallback services when CMS returns empty array', () => {
    mockData([]);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('The Sovereign Protocol')).toBeInTheDocument();
  });

  // ── CMS data ────────────────────────────────────────────────────────────

  it('renders CMS services when provided', () => {
    const cmsServices = [
      {
        id: 'cms-1',
        title: 'CMS Service One',
        subtitle: 'Sub One',
        description: 'Desc one',
        icon: 'FaRocket',
        order: 1,
        active: true,
      },
      {
        id: 'cms-2',
        title: 'CMS Service Two',
        subtitle: 'Sub Two',
        description: 'Desc two',
        icon: 'FaStar',
        order: 2,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('CMS Service One')).toBeInTheDocument();
    expect(screen.getByText('CMS Service Two')).toBeInTheDocument();
  });

  it('filters out inactive CMS services', () => {
    const cmsServices = [
      {
        id: 'a',
        title: 'Active Service',
        subtitle: '',
        description: 'Active',
        icon: null,
        order: 1,
        active: true,
      },
      {
        id: 'b',
        title: 'Inactive Service',
        subtitle: '',
        description: 'Inactive',
        icon: null,
        order: 2,
        active: false,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('Active Service')).toBeInTheDocument();
    expect(screen.queryByText('Inactive Service')).not.toBeInTheDocument();
  });

  it('sorts CMS services by order ascending', () => {
    const cmsServices = [
      {
        id: 'c',
        title: 'Third',
        subtitle: '',
        description: '',
        icon: null,
        order: 3,
        active: true,
      },
      {
        id: 'a',
        title: 'First',
        subtitle: '',
        description: '',
        icon: null,
        order: 1,
        active: true,
      },
      {
        id: 'b',
        title: 'Second',
        subtitle: '',
        description: '',
        icon: null,
        order: 2,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    const texts = headings.map(h => h.textContent);
    expect(texts).toEqual(['First', 'Second', 'Third']);
  });

  // ── Unique keys (regression for duplicate key fix) ──────────────────────

  it('renders services without React key warnings when ids are present', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cmsServices = [
      {
        id: 'u1',
        title: 'Unique A',
        subtitle: '',
        description: '',
        icon: null,
        order: 1,
        active: true,
      },
      {
        id: 'u2',
        title: 'Unique B',
        subtitle: '',
        description: '',
        icon: null,
        order: 2,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    // No 'Each child in a list should have a unique "key"' errors expected
    const keyWarning = errSpy.mock.calls.find(args =>
      String(args[0]).includes('unique "key"')
    );
    expect(keyWarning).toBeUndefined();
    errSpy.mockRestore();
  });

  it('uses index-based fallback key when service id is missing', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const cmsServices = [
      {
        id: undefined,
        title: 'No ID A',
        subtitle: '',
        description: '',
        icon: null,
        order: 1,
        active: true,
      },
      {
        id: undefined,
        title: 'No ID B',
        subtitle: '',
        description: '',
        icon: null,
        order: 2,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('No ID A')).toBeInTheDocument();
    expect(screen.getByText('No ID B')).toBeInTheDocument();
    // Should still render without key duplicate errors
    const keyWarning = errSpy.mock.calls.find(args =>
      String(args[0]).includes('unique "key"')
    );
    expect(keyWarning).toBeUndefined();
    errSpy.mockRestore();
  });

  // ── Icons & subtitles ───────────────────────────────────────────────────

  it('renders DynamicIcon when service has an icon', () => {
    const cmsServices = [
      {
        id: 'i1',
        title: 'Icon Service',
        subtitle: 'Sub',
        description: 'Desc',
        icon: 'FaBolt',
        order: 1,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByTestId('dynamic-icon')).toBeInTheDocument();
    expect(screen.getByTestId('dynamic-icon')).toHaveAttribute(
      'data-icon',
      'FaBolt'
    );
  });

  it('does not render icon element when service has no icon', () => {
    const cmsServices = [
      {
        id: 'n1',
        title: 'No Icon',
        subtitle: '',
        description: 'Desc',
        icon: null,
        order: 1,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.queryByTestId('dynamic-icon')).not.toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    const cmsServices = [
      {
        id: 's1',
        title: 'Has Subtitle',
        subtitle: 'My Subtitle',
        description: 'Desc',
        icon: null,
        order: 1,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByText('My Subtitle')).toBeInTheDocument();
  });

  // ── Rich text description ────────────────────────────────────────────────

  it('renders rich text description for Contentful document objects', () => {
    const richTextDoc = {
      nodeType: 'document',
      content: [{ value: 'Rich text content here' }],
    };
    const cmsServices = [
      {
        id: 'rt1',
        title: 'Rich Text Service',
        subtitle: '',
        description: richTextDoc,
        icon: null,
        order: 1,
        active: true,
      },
    ];
    mockData(cmsServices);
    render(<Services theme="catppuccin" />);
    expect(screen.getByTestId('rich-text')).toBeInTheDocument();
    expect(screen.getByTestId('rich-text').textContent).toBe(
      'Rich text content here'
    );
  });

  it('renders plain string description as a paragraph', () => {
    mockData(null); // use fallback data which has string descriptions
    render(<Services theme="catppuccin" />);
    // Fallback descriptions are plain strings rendered as <p> tags
    const para = screen.getAllByText(
      /Building robust, personal agentic architectures/i
    )[0];
    expect(para.tagName).toBe('P');
  });

  // ── CTA section ─────────────────────────────────────────────────────────

  it('renders the CTA booking link', () => {
    mockData(null);
    render(<Services theme="catppuccin" />);
    const link = screen.getByRole('link', { name: /Book a Consultation/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'mailto:ulises@luxspark.com');
  });

  // ── Theme helpers ────────────────────────────────────────────────────────

  describe('getCardClasses', () => {
    it('returns catppuccin classes for catppuccin theme', () => {
      expect(getCardClasses('catppuccin')).toContain('bg-catppuccin-surface');
    });

    it('returns flexoki classes for flexoki theme', () => {
      expect(getCardClasses('flexoki')).toContain('bg-flexoki-surface');
    });

    it('returns matrix classes for matrix theme', () => {
      expect(getCardClasses('matrix')).toContain('bg-matrix-terminal');
    });

    it('returns web2 classes for web2 theme', () => {
      expect(getCardClasses('web2')).toContain('bg-web2-background');
    });

    it('falls back to catppuccin for unknown theme', () => {
      expect(getCardClasses('unknown')).toContain('bg-catppuccin-surface');
    });
  });

  describe('getIconClasses', () => {
    it('returns catppuccin-blue for catppuccin theme', () => {
      expect(getIconClasses('catppuccin')).toContain('text-catppuccin-blue');
    });

    it('returns flexoki-cyan for flexoki theme', () => {
      expect(getIconClasses('flexoki')).toContain('text-flexoki-cyan');
    });

    it('returns matrix-glow for matrix theme', () => {
      expect(getIconClasses('matrix')).toContain('text-matrix-glow');
    });

    it('returns web2-primary for web2 theme', () => {
      expect(getIconClasses('web2')).toContain('text-web2-primary');
    });

    it('falls back to catppuccin-blue for unknown theme', () => {
      expect(getIconClasses('unknown')).toContain('text-catppuccin-blue');
    });
  });

  describe('getCtaBorderClasses', () => {
    it('returns catppuccin border classes for catppuccin theme', () => {
      expect(getCtaBorderClasses('catppuccin')).toContain(
        'border-catppuccin-blue/30'
      );
    });

    it('returns flexoki border classes for flexoki theme', () => {
      expect(getCtaBorderClasses('flexoki')).toContain(
        'border-flexoki-cyan/30'
      );
    });

    it('returns matrix border classes for matrix theme', () => {
      expect(getCtaBorderClasses('matrix')).toContain('border-matrix-glow/30');
    });

    it('returns web2 border classes for web2 theme', () => {
      expect(getCtaBorderClasses('web2')).toContain('border-web2-primary/30');
    });
  });

  describe('getCtaButtonClasses', () => {
    it('returns catppuccin button classes for catppuccin theme', () => {
      expect(getCtaButtonClasses('catppuccin')).toContain('bg-catppuccin-blue');
    });

    it('returns flexoki button classes for flexoki theme', () => {
      expect(getCtaButtonClasses('flexoki')).toContain('bg-flexoki-cyan');
    });

    it('returns matrix button classes for matrix theme', () => {
      expect(getCtaButtonClasses('matrix')).toContain('bg-matrix-glow');
    });

    it('returns web2 button classes for web2 theme', () => {
      expect(getCtaButtonClasses('web2')).toContain('bg-web2-primary');
    });
  });
});
