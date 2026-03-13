import { useState, useEffect } from 'react';
import AnalyticsProvider from './components/AnalyticsProvider';
import Header from './components/Header';
import Profile from './components/Profile';
import Projects from './components/Projects/Projects';
import Services from './components/Services';
import Skills from './components/Skills';
import FeaturedContent from './components/FeaturedContent';
import Footer from './components/Footer';
import MountainFooter from './components/MountainFooter';
import NavBar from './components/NavBar';
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
            <NavBar
              theme={theme}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

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
