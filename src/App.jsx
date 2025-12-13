import { useState, useEffect } from 'react';
import AnalyticsProvider from './components/AnalyticsProvider';
import Header from './components/Header';
import Profile from './components/Profile';
import Projects from './components/Projects/Projects';
import LatestPost from './components/LatestPost';
import YouTube from './components/YouTube';
import Footer from './components/Footer';
import MountainFooter from './components/MountainFooter';
import { Web2NavBar } from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';
import consoleEasterEgg from './utils/consoleEasterEgg';
import clsx from 'clsx';
import SocialLinks from './components/SocialLinks';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = sessionStorage.getItem('theme');
    // Default to xmas theme in December, otherwise dark
    if (!savedTheme) {
      const currentMonth = new Date().getMonth();
      return currentMonth === 11 ? 'xmas' : 'dark'; // 11 = December
    }
    return savedTheme;
  });

  // Apply theme to body
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'dark',
      'matrix',
      'light',
      'web2',
      'xmas'
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
      <div className="max-w-2xl mx-auto px-4 py-6 relative flex">
        <div style={{ flex: 1 }}>
          <Header theme={theme} setTheme={setTheme} />
          <main
            className={clsx(
              'bg-white dark:bg-dracula-currentLine rounded-xl shadow-md overflow-hidden mb-6',
              'opacity-0 transform translate-y-5 animate-fade-in',
              'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:shadow-matrix-glow',
              'web2:bg-web2-background web2:border-web2-border',
              'xmas:border-xmas-gold xmas:border-2 xmas:shadow-lg xmas:shadow-xmas-glow'
            )}
          >
            {theme === 'web2' && <Web2NavBar theme={theme} />}
            <ErrorBoundary theme={theme}>
              <Profile theme={theme} />
            </ErrorBoundary>
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
          </main>

          {theme === 'web2' ? <MountainFooter /> : <Footer theme={theme} />}
        </div>
      </div>
    </>
  );
}

export default App;
