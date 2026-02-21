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
