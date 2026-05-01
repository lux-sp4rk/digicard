import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import LocationIndicator from './LocationIndicator';

const Web2Header = () => {
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
            'web2:text-web2-accent web2:font-web2Heading',
            'hover:web2:text-web2-accent cursor-pointer group'
          )}
        >
          Luh Sprwhk
        </span>
      </div>
      <div className={clsx('flex gap-4 text-xl')}>
        <a
          href="https://luhsprwhk.beehiiv.com"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary',
            'hover:web2:text-web2-accent'
          )}
        >
          <DynamicIcon iconName="FaRssSquare" />
        </a>
        <a
          href="https://github.com/luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary',
            'hover:web2:text-web2-accent'
          )}
        >
          <DynamicIcon iconName="FaGithub" />
        </a>
        <a
          href="https://twitter.com/luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary',
            'hover:web2:text-web2-accent'
          )}
        >
          <DynamicIcon iconName="FaTwitter" />
        </a>
        <a
          href="https://youtube.com/@luhsprwhk"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'web2:text-web2-secondary',
            'hover:web2:text-web2-accent'
          )}
        >
          <DynamicIcon iconName="FaYoutube" />
        </a>
        <div className="flex items-center">
          <LocationIndicator theme="web2" className="!mt-0" />
        </div>
      </div>
    </div>
  );
};

const NavBar = ({ theme, activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'services',
      label: 'Services',
      ariaLabel: 'Switch to Services tab',
      iconName: 'FaUsers',
    },
    {
      id: 'work',
      label: 'The Work',
      ariaLabel: 'Switch to The Work tab',
      iconName: 'FaBriefcase',
    },
    {
      id: 'skills',
      label: 'Skills',
      ariaLabel: 'Switch to Skills tab',
      iconName: 'FaWandMagicSparkles',
    },
  ];

  return (
    <nav className="flex flex-col">
      {theme === 'web2' && <Web2Header />}

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
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.ariaLabel}
            aria-selected={activeTab === tab.id}
            role="tab"
            className={clsx(
              'flex-1 py-5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300',
              'flex items-center justify-center gap-3',
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
            <DynamicIcon iconName={tab.iconName} className="text-lg" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export { Web2Header as Web2NavBar };
export default NavBar;
