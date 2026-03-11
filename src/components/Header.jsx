import ThemeSwitch from './ThemeSwitch';
import clsx from 'clsx';

const Header = ({ theme, setTheme }) => {
  // Don't show the toggle in matrix or xmas mode
  const isMinimal = theme === 'matrix' || theme === 'xmas';

  return (
    <header className={clsx('flex justify-end mb-5', isMinimal && 'mb-5')}>
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
