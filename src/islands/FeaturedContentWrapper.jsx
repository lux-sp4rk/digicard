import { useState, useEffect } from 'react';
import FeaturedContent from '../components/FeaturedContent';

/**
 * Wrapper that reads the current theme from <html class="..."> and
 * passes it to the React FeaturedContent component. Astro's island
 * hydration (client:load) mounts this so the component can fetch
 * Substack / YouTube / Instagram / SoundCloud data at runtime.
 */
export default function FeaturedContentWrapper() {
  const [theme, setTheme] = useState('catppuccin');

  useEffect(() => {
    const THEMES = ['catppuccin', 'flexoki', 'matrix', 'xmas', 'web2'];

    const updateTheme = () => {
      const html = document.documentElement;
      const current =
        THEMES.find(t => html.classList.contains(t)) || 'catppuccin';
      setTheme(current);
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return <FeaturedContent theme={theme} />;
}
