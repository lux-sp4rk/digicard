import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import LocationIndicator from './LocationIndicator';

const Web2Header = () => {
  return (
    <div
      className={clsx(
        'flex justify-between items-center overflow-visible',
        'bg-web2-gradient bg-web2-primaryDark',
        'px-4 py-3',
        'shadow-web2-glossy',
        'border-b-2 border-web2-primary/30'
      )}
      style={{
        background: 'linear-gradient(to bottom, #4A90E2, #0088CC, #005580)',
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
          <span className="text-xl">🚀</span>
        </div>
        <span
          className={clsx(
            'text-xl font-web2Heading font-bold text-white',
            'drop-shadow-md'
          )}
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
        >
          Lux Sp4rk
        </span>
        <span className="web2-badge text-[10px]">PRO</span>
      </div>
      <div className={clsx('flex gap-3 text-lg')}>
        {[
          { icon: 'FaRssSquare', href: 'https://luhsprwhk.beehiiv.com' },
          { icon: 'FaGithub', href: 'https://github.com/luhsprwhk' },
          { icon: 'FaTwitter', href: 'https://twitter.com/luhsprwhk' },
          { icon: 'FaYoutube', href: 'https://youtube.com/@luhsprwhk' },
        ].map(({ icon, href }) => (
          <a
            key={icon}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'w-9 h-9 rounded-full bg-white/20 flex items-center justify-center',
              'text-white hover:text-web2-accent hover:bg-white/30',
              'shadow-sm hover:shadow-md',
              'transition-all duration-150'
            )}
            style={{
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <DynamicIcon iconName={icon} />
          </a>
        ))}
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
      iconName: 'FaRobot',
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
              theme === 'web2' &&
                (activeTab === tab.id ? 'web2-nav-tab-active' : 'web2-nav-tab'),
              theme !== 'web2' && activeTab === tab.id
                ? [
                    'border-b-2',
                    theme === 'catppuccin' &&
                      'border-catppuccin-blue text-catppuccin-blue',
                    theme === 'flexoki' &&
                      'border-flexoki-cyan text-flexoki-cyan',
                    theme === 'matrix' &&
                      'border-matrix-glow text-matrix-glow bg-matrix-glow/10',
                  ]
                : theme !== 'web2' && 'opacity-50 hover:opacity-100'
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
