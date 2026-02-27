/**
 * Helper function to get theme-specific CSS module class names
 * @param {Object} styles - CSS module styles object
 * @param {string} theme - Current theme (e.g., 'github', 'dark', 'matrix', 'web2')
 * @param {string} baseClass - Base class name without theme suffix
 * @returns {string} - The appropriate CSS module class name for the theme
 */
export const getThemeClass = (styles, theme, baseClass) => {
  const themeMap = {
    github: 'Github',
    dark: 'Dracula',
    matrix: 'Matrix',
    web2: 'Web2',
    xmas: 'Xmas',
    csszen: 'Csszen',
    catppuccin: 'Catppuccin',
    flexoki: 'Flexoki',
    rosepine: 'Rosepine',
  };

  const themeSuffix = themeMap[theme] || 'Github';
  return styles[`${baseClass}${themeSuffix}`];
};

/**
 * Helper function to create a theme class getter bound to specific styles
 * @param {Object} styles - CSS module styles object
 * @returns {Function} - Function that takes (theme, baseClass) and returns the theme class
 */
export const createThemeClassGetter = styles => {
  return (theme, baseClass) => getThemeClass(styles, theme, baseClass);
};

/**
 * Tailwind-specific theme class helpers for card elements.
 * Shared across ContentList and other components.
 */
export const getCardClasses = theme => {
  if (theme === 'flexoki')
    return 'bg-flexoki-surface border-flexoki-surface text-flexoki-text';
  if (theme === 'matrix')
    return 'bg-matrix-terminal border-matrix-glow text-matrix-glow shadow-[0_0_10px_rgba(0,255,0,0.1)]';
  if (theme === 'web2')
    return 'bg-web2-background border-web2-border shadow-sm';
  return 'bg-catppuccin-surface border-catppuccin-surface text-catppuccin-text';
};

export const getIconClasses = theme => {
  if (theme === 'flexoki') return 'text-flexoki-cyan';
  if (theme === 'matrix') return 'text-matrix-glow';
  if (theme === 'web2') return 'text-web2-primary';
  return 'text-catppuccin-blue';
};

export const getCtaBorderClasses = theme => {
  if (theme === 'flexoki') return 'border-flexoki-cyan/30 text-flexoki-text';
  if (theme === 'matrix') return 'border-matrix-glow/30 text-matrix-glow';
  if (theme === 'web2') return 'border-web2-primary/30 text-web2-text';
  return 'border-catppuccin-blue/30 text-catppuccin-text';
};

export const getCtaButtonClasses = theme => {
  if (theme === 'flexoki') return 'bg-flexoki-cyan text-flexoki-base';
  if (theme === 'matrix')
    return 'bg-matrix-glow text-matrix-terminal shadow-[0_0_15px_#0f0]';
  if (theme === 'web2') return 'bg-web2-primary text-white';
  return 'bg-catppuccin-blue text-catppuccin-base';
};
