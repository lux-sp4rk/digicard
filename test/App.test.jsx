import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/components/AnalyticsProvider', () => ({
  default: () => <div data-testid="analytics-provider">Analytics</div>,
}));

vi.mock('../src/components/Header', () => ({
  default: ({ theme, setTheme }) => (
    <div data-testid="header" data-theme={theme}>
      <button type="button" onClick={() => setTheme('matrix')}>
        Set Matrix
      </button>
      <button type="button" onClick={() => setTheme('web2')}>
        Set Web2
      </button>
      <button type="button" onClick={() => setTheme('xmas')}>
        Set Xmas
      </button>
      <button type="button" onClick={() => setTheme('catppuccin')}>
        Set Catppuccin
      </button>
      <button type="button" onClick={() => setTheme('flexoki')}>
        Set Flexoki
      </button>
    </div>
  ),
}));

vi.mock('../src/components/Profile', () => ({
  default: ({ theme }) => (
    <div data-testid="profile" data-theme={theme}>
      Profile
    </div>
  ),
}));

vi.mock('../src/components/Projects/Projects', () => ({
  default: ({ theme }) => (
    <div data-testid="projects" data-theme={theme}>
      Projects
    </div>
  ),
}));

vi.mock('../src/components/Services', () => ({
  default: ({ theme }) => (
    <div data-testid="services" data-theme={theme}>
      Services
    </div>
  ),
}));

vi.mock('../src/components/Skills', () => ({
  default: ({ theme }) => (
    <div data-testid="skills" data-theme={theme}>
      Skills
    </div>
  ),
}));

vi.mock('../src/components/LatestPost', () => ({
  default: ({ theme, featured }) => (
    <div data-testid="latest-post" data-theme={theme} data-featured={featured}>
      Latest Post
    </div>
  ),
}));

vi.mock('../src/components/YouTube', () => ({
  default: ({ theme, featured }) => (
    <div data-testid="youtube" data-theme={theme} data-featured={featured}>
      YouTube
    </div>
  ),
}));

vi.mock('../src/components/Footer', () => ({
  default: ({ theme }) => (
    <div data-testid="footer" data-theme={theme}>
      Footer
    </div>
  ),
}));

vi.mock('../src/components/MountainFooter', () => ({
  default: () => <div data-testid="mountain-footer">Mountain Footer</div>,
}));

vi.mock('../src/components/SocialLinks', () => ({
  default: () => <div data-testid="social-links">Social Links</div>,
}));

vi.mock('../src/components/NavBar', () => ({
  default: ({ theme, activeTab, setActiveTab }) => (
    <div data-testid="navbar" data-theme={theme} data-active-tab={activeTab}>
      <button
        role="tab"
        aria-selected={activeTab === 'work'}
        onClick={() => setActiveTab('work')}
      >
        The Work
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'skills'}
        onClick={() => setActiveTab('skills')}
      >
        Skills
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'services'}
        onClick={() => setActiveTab('services')}
      >
        Services
      </button>
      {theme === 'web2' && <div data-testid="web2-navbar">Web2 Part</div>}
    </div>
  ),
}));

vi.mock('../src/components/ErrorBoundary', () => ({
  default: ({ children, theme }) => (
    <div data-testid="error-boundary" data-theme={theme}>
      {children}
    </div>
  ),
}));

vi.mock('../src/components/Snowfall', () => ({
  default: () => <div data-testid="snowfall">Snowfall</div>,
}));

vi.mock('../src/utils/consoleEasterEgg', () => ({
  default: vi.fn(() => vi.fn()),
}));

vi.mock('../src/utils/themeInitializer', () => ({
  getInitialTheme: vi.fn(() => 'catppuccin'),
}));

// Import App after mocks
import App from '../src/App';
import consoleEasterEgg from '../src/utils/consoleEasterEgg';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
    document.body.className = '';
    sessionStorage.clear();
  });

  afterEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
  });

  it('renders with default theme', () => {
    render(<App />);
    expect(screen.getByTestId('analytics-provider')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('profile')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('applies theme class to document', () => {
    render(<App />);
    expect(document.documentElement.classList.contains('catppuccin')).toBe(
      true
    );
  });

  it('changes theme when setTheme is called', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Set Matrix'));
    expect(document.documentElement.classList.contains('matrix')).toBe(true);
    expect(sessionStorage.getItem('theme')).toBe('matrix');
  });

  it('adds matrix-bg class for matrix theme', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Set Matrix'));
    expect(document.body.classList.contains('matrix-bg')).toBe(true);
  });

  it('removes matrix-bg class when switching away from matrix', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Set Matrix'));
    expect(document.body.classList.contains('matrix-bg')).toBe(true);
    fireEvent.click(screen.getByText('Set Catppuccin'));
    expect(document.body.classList.contains('matrix-bg')).toBe(false);
  });

  it('renders Snowfall for xmas theme', () => {
    render(<App />);
    expect(screen.queryByTestId('snowfall')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Set Xmas'));
    expect(screen.getByTestId('snowfall')).toBeInTheDocument();
  });

  it('renders Web2NavBar for web2 theme', () => {
    render(<App />);
    expect(screen.queryByTestId('web2-navbar')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Set Web2'));
    expect(screen.getByTestId('web2-navbar')).toBeInTheDocument();
  });

  it('renders MountainFooter for web2 theme', () => {
    render(<App />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.queryByTestId('mountain-footer')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Set Web2'));
    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
    expect(screen.getByTestId('mountain-footer')).toBeInTheDocument();
  });

  it('hides SocialLinks inline for web2 theme', () => {
    render(<App />);
    expect(screen.getByTestId('social-links')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Set Web2'));
    expect(screen.queryByTestId('social-links')).not.toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<App />);
    expect(screen.getByTestId('projects')).toBeInTheDocument();
    expect(screen.getByTestId('youtube')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /skills/i }));
    expect(screen.getByTestId('skills')).toBeInTheDocument();
    expect(screen.queryByTestId('projects')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /services/i }));
    expect(screen.getByTestId('services')).toBeInTheDocument();
    expect(screen.queryByTestId('skills')).not.toBeInTheDocument();
  });

  it('marks active tab correctly', () => {
    render(<App />);
    const workTab = screen.getByRole('tab', { name: /the work/i });
    expect(workTab).toHaveAttribute('aria-selected', 'true');
    const skillsTab = screen.getByRole('tab', { name: /skills/i });
    fireEvent.click(skillsTab);
    expect(skillsTab).toHaveAttribute('aria-selected', 'true');
    expect(workTab).toHaveAttribute('aria-selected', 'false');
  });

  it('wraps components in ErrorBoundary', () => {
    render(<App />);
    expect(screen.getAllByTestId('error-boundary').length).toBeGreaterThan(0);
  });

  it('initializes console easter egg on mount', () => {
    render(<App />);
    expect(consoleEasterEgg).toHaveBeenCalledTimes(1);
  });

  it('cleans up console easter egg on unmount', () => {
    const mockCleanup = vi.fn();
    consoleEasterEgg.mockReturnValue(mockCleanup);
    const { unmount } = render(<App />);
    unmount();
    expect(mockCleanup).toHaveBeenCalledTimes(1);
  });
});
