import clsx from 'clsx';

/**
 * LocationIndicator - Theme-aware location display for Local SEO
 *
 * Shows Austin, TX location with dynamic formatting based on active theme:
 * - Terminal/Catppuccin: "LOC: ATX_USA" or "system.origin: austin_tx"
 * - Web 2.0 / Flexoki: "📍 Austin, TX"
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme name
 */
const LocationIndicator = ({ theme }) => {
  // Get the display text based on theme
  const getLocationText = () => {
    if (theme === 'matrix') {
      return 'system.origin: austin_tx';
    }
    if (theme === 'catppuccin') {
      return 'LOC: ATX_USA';
    }
    if (theme === 'web2' || theme === 'flexoki') {
      return '📍 Austin, TX';
    }
    // Default fallback
    return '📍 Austin, TX';
  };

  // Get font styling based on theme
  const getFontClasses = () => {
    if (theme === 'matrix') {
      return 'font-mono text-xs tracking-wider';
    }
    if (theme === 'catppuccin') {
      return 'font-mono text-xs tracking-widest uppercase';
    }
    if (theme === 'web2') {
      return 'font-web2 text-sm';
    }
    if (theme === 'flexoki') {
      return 'text-sm font-medium';
    }
    return 'text-sm';
  };

  // Get color classes based on theme
  const getColorClasses = () => {
    if (theme === 'matrix') {
      return 'text-matrix-glow/70';
    }
    if (theme === 'catppuccin') {
      return 'text-catppuccin-text/60';
    }
    if (theme === 'web2') {
      return 'text-web2-textLight';
    }
    if (theme === 'flexoki') {
      return 'text-flexoki-text/70';
    }
    return 'opacity-60';
  };

  // Hide on xmas and matrix (matrix handles location differently via system.origin)
  if (theme === 'xmas') {
    return null;
  }

  return (
    <div
      className={clsx(
        'mt-1 transition-all duration-300',
        getFontClasses(),
        getColorClasses()
      )}
      aria-label="Location: Austin, Texas"
    >
      {getLocationText()}
    </div>
  );
};

export default LocationIndicator;
