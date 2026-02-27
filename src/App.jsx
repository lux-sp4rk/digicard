import { useState, useEffect } from 'react';
import AnalyticsProvider from './components/AnalyticsProvider';
import Header from './components/Header';
import Profile from './components/Profile';
import Projects from './components/Projects/Projects';
import Services from './components/Services';
import Skills from './components/Skills';
import LatestPost from './components/LatestPost';
import YouTube from './components/YouTube';
import Footer from './components/Footer';
import MountainFooter from './components/MountainFooter';
import { Web2NavBar } from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';
import consoleEasterEgg from './utils/consoleEasterEgg';
import { getInitialTheme } from './utils/themeInitializer';
import clsx from 'clsx';
import SocialLinks from './components/SocialLinks';
import Snowfall from './components/Snowfall';

function App() {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [activeTab, setActiveTab] = useState('work'); // 'work', 'services', or 'skills'

  // Apply theme to body
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'dark',
      'matrix',
      'light',
      'web2',
      'xmas',
      'catppuccin',
      'flexoki'
    );
    // Add the current theme class
    document.documentElement.classList.add(theme);
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle matrix background on <body>
  useEffect(() => {
    if (theme === 'matrix') {
      document.body.classList.add('matrix-bg');
    } else {
      document.body.classList.remove('matrix-bg');
    }
    // Cleanup in case of hot reloads/unmount
    return () => {
      document.body.classList.remove('matrix-bg');
    };
  }, [theme]);

  useEffect(() => {
    const cleanupFn = consoleEasterEgg(setTheme);
    return cleanupFn; // Return the cleanup function provided by the utility
  }, [setTheme]);

  return (
    <>
      <AnalyticsProvider />
      {theme === 'xmas' && <Snowfall />}
      <div className="max-w-2xl mx-auto px-4 py-6 relative flex">
        <div style={{ flex: 1 }}>
          <Header theme={theme} setTheme={setTheme} />
          <main
            className={clsx(
              'bg-white dark:bg-dracula-currentLine rounded-xl shadow-md overflow-hidden mb-6',
              'opacity-0 transform translate-y-5 animate-fade-in',
              'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:shadow-matrix-glow',
              'web2:bg-web2-background web2:border-web2-border',
              'xmas:border-xmas-gold xmas:border-2 xmas:shadow-lg xmas:shadow-xmas-glow',
              'catppuccin:bg-catppuccin-base catppuccin:text-catppuccin-text catppuccin:border-catppuccin-surface catppuccin:border',
              'flexoki:bg-flexoki-base flexoki:text-flexoki-text flexoki:border-flexoki-surface flexoki:border'
            )}
          >
            {theme === 'web2' && <Web2NavBar theme={theme} />}

            {/* Tab Switcher */}
            <div
              className={clsx(
                'flex border-b',
                theme === 'catppuccin' && 'border-catppuccin-surface',
                theme === 'flexoki' && 'border-flexoki-surface',
                theme === 'matrix' && 'border-matrix-glow',
                theme === 'web2' && 'border-web2-divider'
              )}
            >
              <button
                onClick={() => setActiveTab('work')}
                aria-label="Switch to The Work tab"
                aria-selected={activeTab === 'work'}
                role="tab"
                className={clsx(
                  'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all',
                  activeTab === 'work'
                    ? [
                        'border-b-2',
                        theme === 'catppuccin' &&
                          'border-catppuccin-blue text-catppuccin-blue',
                        theme === 'flexoki' &&
                          'border-flexoki-cyan text-flexoki-cyan',
                        theme === 'matrix' &&
                          'border-matrix-glow text-matrix-glow bg-matrix-glow/10',
                        theme === 'web2' &&
                          'border-web2-primary text-web2-primary bg-web2-highlight',
                      ]
                    : 'opacity-50 hover:opacity-100'
                )}
              >
                The Work
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                aria-label="Switch to Skills tab"
                aria-selected={activeTab === 'skills'}
                role="tab"
                className={clsx(
                  'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all',
                  activeTab === 'skills'
                    ? [
                        'border-b-2',
                        theme === 'catppuccin' &&
                          'border-catppuccin-blue text-catppuccin-blue',
                        theme === 'flexoki' &&
                          'border-flexoki-cyan text-flexoki-cyan',
                        theme === 'matrix' &&
                          'border-matrix-glow text-matrix-glow bg-matrix-glow/10',
                        theme === 'web2' &&
                          'border-web2-primary text-web2-primary bg-web2-highlight',
                      ]
                    : 'opacity-50 hover:opacity-100'
                )}
              >
                Skills
              </button>
              <button
                onClick={() => setActiveTab('services')}
                aria-label="Switch to Services tab"
                aria-selected={activeTab === 'services'}
                role="tab"
                className={clsx(
                  'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all',
                  activeTab === 'services'
                    ? [
                        'border-b-2',
                        theme === 'catppuccin' &&
                          'border-catppuccin-blue text-catppuccin-blue',
                        theme === 'flexoki' &&
                          'border-flexoki-cyan text-flexoki-cyan',
                        theme === 'matrix' &&
                          'border-matrix-glow text-matrix-glow bg-matrix-glow/10',
                        theme === 'web2' &&
                          'border-web2-primary text-web2-primary bg-web2-highlight',
                      ]
                    : 'opacity-50 hover:opacity-100'
                )}
              >
                Services
              </button>
            </div>

            <ErrorBoundary theme={theme}>
              <Profile theme={theme} />
            </ErrorBoundary>

            {activeTab === 'work' && (
              <>
                {/* Only show Links inline for non-web2 themes */}
                {theme !== 'web2' && (
                  <ErrorBoundary theme={theme}>
                    <SocialLinks />
                  </ErrorBoundary>
                )}
                {/* Featured Content goes here */}
                <ErrorBoundary theme={theme}>
                  <YouTube theme={theme} featured={true} />
                </ErrorBoundary>
                <ErrorBoundary theme={theme}>
                  <LatestPost theme={theme} featured={false} />
                </ErrorBoundary>
                <ErrorBoundary theme={theme}>
                  <Projects theme={theme} />
                </ErrorBoundary>
              </>
            )}

            {activeTab === 'skills' && (
              <ErrorBoundary theme={theme}>
                <Skills theme={theme} />
              </ErrorBoundary>
            )}

            {activeTab === 'services' && (
              <ErrorBoundary theme={theme}>
                <Services theme={theme} />
              </ErrorBoundary>
            )}
          </main>

          {theme === 'web2' ? <MountainFooter /> : <Footer theme={theme} />}
        </div>
      </div>
    </>
  );
}

export default App;
