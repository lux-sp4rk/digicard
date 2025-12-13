/**
 * Gets the initial theme based on saved preference or default logic.
 * 
 * @param {Object} options - Configuration options
 * @param {Storage} options.storage - Storage object (defaults to sessionStorage)
 * @param {Date} options.currentDate - Current date (defaults to new Date())
 * @returns {string} The initial theme value
 */
export function getInitialTheme({ storage = sessionStorage, currentDate = new Date() } = {}) {
  const savedTheme = storage.getItem('theme');
  
  // Default to xmas theme in December, otherwise dark
  if (!savedTheme) {
    const currentMonth = currentDate.getMonth();
    return currentMonth === 11 ? 'xmas' : 'dark'; // 11 = December
  }
  
  return savedTheme;
}

