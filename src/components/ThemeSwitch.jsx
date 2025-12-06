import clsx from 'clsx';

const ThemeSwitch = ({ theme, setTheme }) => {
  return (
    <select
      value={theme}
      onChange={e => setTheme(e.target.value)}
      className={clsx(
        'w-full mt-1 px-2 py-1 rounded',
        theme === 'web2' &&
          'web2:bg-web2-primaryDark web2:text-white web2:border-web2-border web2:shadow-web2-border web2:drop-shadow-web2-border',
        theme === 'matrix' &&
          'matrix:bg-matrix-terminal matrix:border-matrix-glow matrix:shadow-lg matrix:shadow-matrix-glow',
        theme === 'light' && 'bg-white dark:bg-dracula-currentLine',
        theme === 'dark' && 'dark:bg-dracula-currentLine'
      )}
    >
      <option value="light">Github</option>
      <option value="dark">Dracula</option>
      <option value="web2">Web 2.0</option>
    </select>
  );
};

export default ThemeSwitch;
