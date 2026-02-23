/**
 * Gets the initial theme based on saved preference or default logic.
 * During December, forces 'xmas' theme as a seasonal override (date takes priority).
 *
 * @param {Object} options - Configuration options
 * @param {Storage} options.storage - Storage object (defaults to sessionStorage)
 * @param {Date} options.currentDate - Current date (defaults to new Date())
 * @returns {string} The initial theme value
 */
export function getInitialTheme({
  storage = sessionStorage,
  currentDate = new Date(),
} = {}) {
  const currentMonth = currentDate.getMonth();
  const isDecember = currentMonth === 11; // 11 = December

  // Force xmas theme during December (seasonal override, date takes priority)
  if (isDecember) {
    return 'xmas';
  }

  // For non-December months, use saved theme or default to catppuccin
  const savedTheme = storage.getItem('theme');

  // Migrate deprecated themes
  if (
    savedTheme === 'dark' ||
    savedTheme === 'light' ||
    savedTheme === 'rosepine'
  ) {
    return 'catppuccin';
  }

  return savedTheme || 'catppuccin';
}
