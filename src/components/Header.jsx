import ThemeSwitch from './ThemeSwitch';
import LocationIndicator from './LocationIndicator';
import clsx from 'clsx';

const Header = ({ theme, setTheme }) => {
  // Don't show the toggle in matrix or xmas mode, but still show location
  const isMinimal = theme === 'matrix' || theme === 'xmas';

  return (
    <header
      className={clsx(
        'flex justify-between items-start mb-5',
        isMinimal && 'mb-5'
      )}
    >
      {/* Location Indicator - Left side */}
      <div className="flex-1">
        <LocationIndicator theme={theme} />
      </div>

      {/* Theme Switcher - Right side (hidden in minimal modes) */}
      {!isMinimal && (
        <div className="relative text-right">
          <label>
            <small>Site Theme</small>
          </label>
          <br />
          <ThemeSwitch theme={theme} setTheme={setTheme} />
        </div>
      )}
    </header>
  );
};

export default Header;
