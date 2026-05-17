import { useState, useEffect } from 'react';
import Skills from '../components/Skills';

export default function SkillsWrapper() {
  const [theme, setTheme] = useState('catppuccin');

  useEffect(() => {
    const THEMES = ['catppuccin', 'flexoki', 'matrix', 'xmas', 'web2'];
    const update = () => {
      const html = document.documentElement;
      const t = THEMES.find(x => html.classList.contains(x)) || 'catppuccin';
      setTheme(t);
    };
    update();
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => obs.disconnect();
  }, []);

  return <Skills theme={theme} />;
}
