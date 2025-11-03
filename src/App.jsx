import { useState, useEffect } from 'react';
import AnalyticsProvider from './components/AnalyticsProvider';
import Header from './components/Header';
import Profile from './components/Profile';
import Projects from './components/Projects/Projects';
import LatestPost from './components/LatestPost';
import YouTube from './components/YouTube';
import SoundCloudWidget from './components/SoundCloudWidget';
import Footer from './components/Footer';
import MountainFooter from './components/MountainFooter';
import { Web2NavBar } from './components/NavBar';
import ErrorBoundary from './components/ErrorBoundary';
import consoleEasterEgg from './utils/consoleEasterEgg';
import clsx from 'clsx';
import cssZenBanner from './assets/css-zen-banner.png';
import SocialLinks from './components/SocialLinks';

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = sessionStorage.getItem('theme');
    // Default to dark if no theme is saved
    return savedTheme || 'dark';
  });

  // Apply theme to body
  useEffect(() => {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'dark',
      'matrix',
      'light',
      'web2',
      'csszen'
    );
    // Add the current theme class
    document.documentElement.classList.add(theme);
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  // NEW: Toggle matrix and web2-bg background on <body>
  useEffect(() => {
    if (theme === 'matrix') {
      document.body.classList.add('matrix-bg');
    } else {
      document.body.classList.remove('matrix-bg');
    }
    if (theme === 'csszen') {
      document.body.classList.add('csszen');
      document.body.classList.add('csszen-bg');
    } else {
      document.body.classList.remove('csszen');
      document.body.classList.remove('csszen-bg');
    }
    // Cleanup in case of hot reloads/unmount
    return () => {
      document.body.classList.remove('matrix-bg');
      document.body.classList.remove('csszen-bg');
    };
  }, [theme]);

  useEffect(() => {
    const cleanupFn = consoleEasterEgg(setTheme);
    return cleanupFn; // Return the cleanup function provided by the utility
  }, [setTheme]);

  return (
    <>
      <AnalyticsProvider />
      <div
        className={clsx(
          theme === 'csszen'
            ? 'max-w-5xl mx-auto px-4 py-6 relative flex flex-row gap-8'
            : 'max-w-2xl mx-auto px-4 py-6 relative flex'
        )}
      >
        {theme === 'csszen' && (
          <img
            src={cssZenBanner}
            alt="CSS Zen Garden Banner"
            className="csszen-banner-img hidden sm:block"
            style={{
              position: 'absolute',
              left: '-80px',
              top: '80px',
              width: '120px',
              zIndex: 10,
              boxShadow: '2px 4px 16px rgba(0,0,0,0.13)',
              borderRadius: '0 1.5rem 1.5rem 0',
              height: '20rem',
            }}
          />
        )}
        {/* Main content */}
        <div style={{ flex: 1 }}>
          <Header theme={theme} setTheme={setTheme} />
          <main
            className={clsx(
              'bg-white dark:bg-dracula-currentLine rounded-xl shadow-md overflow-hidden mb-6',
              'opacity-0 transform translate-y-5 animate-fade-in',
              'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:shadow-matrix-glow',
              'web2:bg-web2-background web2:border-web2-border',
              'csszen:bg-csszen-cream csszen:text-csszen-text csszen:border-csszen-text'
            )}
          >
            {theme === 'web2' && <Web2NavBar theme={theme} />}
            <Profile theme={theme} />
            {/* Only show Links inline for non-csszen and non-web2 themes */}
            {theme !== 'web2' && theme !== 'csszen' ? <SocialLinks /> : null}
            {/* Featured Content goes here */}
            <ErrorBoundary theme={theme}>
              <YouTube theme={theme} featured={true} />
            </ErrorBoundary>
            <ErrorBoundary theme={theme}>
              <LatestPost theme={theme} featured={false} />
            </ErrorBoundary>
            <Projects theme={theme} />
            <ErrorBoundary theme={theme}>
              <SoundCloudWidget theme={theme} />
            </ErrorBoundary>
          </main>

          {theme === 'web2' ? <MountainFooter /> : <Footer theme={theme} />}
        </div>
        {/* CSS Zen sidebar */}
        {theme === 'csszen' && (
          <aside
            className="csszen-sidebar hidden md:block"
            style={{ minWidth: 180, marginLeft: -25, marginTop: '20rem' }}
          >
            <SocialLinks theme={theme} />
          </aside>
        )}
      </div>
    </>
  );
}

export default App;
