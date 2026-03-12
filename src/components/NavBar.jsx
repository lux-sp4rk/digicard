import clsx from 'clsx';
import { useState } from 'react';
import DynamicIcon from './DynamicIcon';

const Web2Header = ({ theme }) => {
  const [active, setActive] = useState(false);
  return (
    <div
      className={clsx(
        'flex justify-between items-center overflow-visible',
        'bg-web2-primaryDark web2:border-web2-border web2:shadow-web2-border web2:drop-shadow-web2-border web2:p-4'
      )}
    >
      <div
        className={clsx(
          'text-2xl font-bold tracking-tight flex items-center gap-2'
        )}
      >
        <span
          className={clsx(
            'relative',
            'web2:text-web2-accent web2:font-web2Heading transition-all duration-400',
            'hover:web2:text-web2-accent hover:underline hover:drop-shadow-md cursor-pointer group',
            theme === 'web2' && !active && 'animate-pulse'
          )}
          tabIndex={0}
          onMouseEnter={() => setActive(true)}
          onFocus={() => setActive(true)}
          onMouseLeave={() => setActive(true)}
          onBlur={() => setActive(true)}
        >
          Luh Sprwhk
          {theme === 'web2' && (
            <span
              className={clsx(
                'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2',
                'opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-400',
                'bg-web2-primary text-dark z-40 text-xs rounded px-3 py-2 shadow-lg whitespace-nowrap'
              )}
            >
              The frontend hides much, but the right tools reveal all.
              <span
                className={clsx(
                  'absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0',
                  'border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-web2-primary'
                )}
              />
            </span>
          )}
        </span>
      </div>
      <div className={clsx('flex gap-4 text-xl')}>
        <a
          href="https://luhsprwhk.beehiiv.com"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary transition-all duration-200',
            'hover:web2:text-web2-accent hover:scale-125'
          )}
        >
          <DynamicIcon iconName="FaRssSquare" />
        </a>
        <a
          href="https://github.com/luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary transition-all duration-200',
            'hover:web2:text-web2-accent hover:scale-125'
          )}
        >
          <DynamicIcon iconName="FaGithub" />
        </a>
        <a
          href="https://twitter.com/luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary transition-all duration-200',
            'hover:web2:text-web2-accent hover:scale-125'
          )}
        >
          <DynamicIcon iconName="FaTwitter" />
        </a>
        <a
          href="https://youtube.com/@luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary transition-all duration-200',
            'hover:web2:text-web2-accent hover:scale-125'
          )}
        >
          <DynamicIcon iconName="FaYoutube" />
        </a>
      </div>
    </div>
  );
};

const NavBar = ({ theme, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'work', label: 'The Work', ariaLabel: 'Switch to The Work tab' },
    { id: 'skills', label: 'Skills', ariaLabel: 'Switch to Skills tab' },
    { id: 'services', label: 'Services', ariaLabel: 'Switch to Services tab' },
  ];

  return (
    <nav className="flex flex-col">
      {theme === 'web2' && <Web2Header theme={theme} />}

      <div
        className={clsx(
          'flex border-b',
          theme === 'catppuccin' && 'border-catppuccin-surface',
          theme === 'flexoki' && 'border-flexoki-surface',
          theme === 'matrix' && 'border-matrix-glow',
          theme === 'web2' && 'border-web2-divider'
        )}
        role="tablist"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.ariaLabel}
            aria-selected={activeTab === tab.id}
            role="tab"
            className={clsx(
              'flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all',
              activeTab === tab.id
                ? [
                    'border-b-2',
                    theme === 'catppuccin' &&
                      'border-catppuccin-blue text-catppuccin-blue',
                    theme === 'flexoki' &&
                      'border-flexoki-cyan text-flexoki-cyan',
                    theme === 'matrix' &&
                      'border-matrix-glow text-matrix-glow bg-matrix-glow/10',
                    theme === 'web2' &&
                      'border-web2-primary text-web2-primary bg-web2-highlight',
                  ]
                : 'opacity-50 hover:opacity-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export { Web2Header as Web2NavBar };
export default NavBar;
