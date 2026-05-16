import { useState, useEffect } from 'react';
import AnalyticsProvider from './components/AnalyticsProvider';
import Header from './components/Header';
import Profile from './components/Profile';
import Projects from './components/Projects/Projects';
import Services from './components/Services';
import FeaturedContent from './components/FeaturedContent';
import Skills from './components/Skills';
import Footer from './components/Footer';
import MountainFooter from './components/MountainFooter';
import NavBar from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';
import consoleEasterEgg from './utils/consoleEasterEgg';
import { getInitialTheme } from './utils/themeInitializer';
import clsx from 'clsx';
import Snowfall from './components/Snowfall';

function App() {
  const [theme, setTheme] = useState(() => getInitialTheme());
  const [activeTab, setActiveTab] = useState('work'); // 'services', 'work', or 'skills'

  // Apply theme to body
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'dark',
      'github',
      'matrix',
      'light',
      'web2',
      'xmas',
      'catppuccin',
      'flexoki',
      'dracula',
      'csszen',
      'rosepine'
    );
    // Add the current theme class
    document.documentElement.classList.add(theme);
    sessionStorage.setItem('theme', theme);

    // Web2 body background
    if (theme === 'web2') {
      document.body.classList.add('web2-bg');
    } else {
      document.body.classList.remove('web2-bg');
    }
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
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="relative">
          {/* Web2 Beta ribbon */}
          {theme === 'web2' && <div className="web2-ribbon">BETA</div>}
          <Header theme={theme} setTheme={setTheme} />
          <main
            className={clsx(
              'bg-white dark:bg-catppuccin-surface rounded-xl overflow-hidden mb-8 md:mb-12',
              'matrix:bg-matrix-terminal matrix:border matrix:border-matrix-glow/30',
              'web2:bg-web2-cardBg web2:border-2 web2:border-web2-border/60 web2:shadow-web2 web2:rounded-2xl',
              'xmas:border-xmas-gold/50 xmas:border',
              'catppuccin:bg-catppuccin-base catppuccin:text-catppuccin-text catppuccin:border catppuccin:border-catppuccin-surface',
              'flexoki:bg-flexoki-base flexoki:text-flexoki-text flexoki:border flexoki:border-flexoki-surface'
            )}
          >
            <NavBar
              theme={theme}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <ErrorBoundary theme={theme}>
              <Profile theme={theme} />
            </ErrorBoundary>

            {activeTab === 'services' && (
              <ErrorBoundary theme={theme}>
                <Services theme={theme} />
              </ErrorBoundary>
            )}

            {activeTab === 'work' && (
              <>
                {/* Featured Content - dynamically ordered by recency */}
                <ErrorBoundary theme={theme}>
                  <FeaturedContent theme={theme} />
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
          </main>

          {theme === 'web2' ? (
            <>
              <MountainFooter />
              <div className="text-center mt-4 pb-4">
                <span className="web2-chrome-badge">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.909c2.298 0 4.322.992 5.754 2.567L12 14.36 5.846 8.128C7.278 6.553 9.702 4.909 12 4.909zM4.909 12c0-.545.073-1.073.209-1.578l3.582 6.209H6.109A7.045 7.045 0 014.909 12zm14.182 0c0 .545-.073 1.073-.209 1.578l-3.582-6.209h2.591A7.045 7.045 0 0119.091 12z" />
                  </svg>
                  Best viewed in Chrome
                </span>
                <span className="web2-chrome-badge ml-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Made with tables
                </span>
              </div>
            </>
          ) : (
            <Footer theme={theme} />
          )}
        </div>
      </div>
    </>
  );
}

export default App;
