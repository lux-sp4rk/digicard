import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import { useProfileData } from '../hooks/useProfileData';

const socialLinks = [
  { name: 'Blog', url: 'https://luhsprwhk.beehiiv.com', icon: 'FaRssSquare' },
  { name: 'GitHub', url: 'https://github.com/luhsprwhk', icon: 'FaGithub' },
  { name: 'Twitter', url: 'https://twitter.com/luhsprwhk', icon: 'FaTwitter' },
  { name: 'YouTube', url: 'https://youtube.com/@luhsprwhk', icon: 'FaYoutube' },
];

const Footer = ({ theme }) => {
  return (
    <footer
      className={clsx(
        'text-center pb-5 px-4 text-sm relative',
        'text-catppuccin-text dark:text-catppuccin-text',
        'matrix:text-matrix-text',
        'catppuccin:text-catppuccin-text',
        'flexoki:text-flexoki-text',
        theme === 'web2' && 'web2'
      )}
    >
      {/* Social Links — web2 maximalist pill style */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {socialLinks.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className={clsx(
              theme === 'web2'
                ? 'social-pill'
                : 'opacity-60 hover:opacity-100 transition-opacity',
              theme === 'matrix' && 'text-matrix-highlight'
            )}
          >
            <DynamicIcon iconName={link.icon} size={16} />
            <span>{link.name}</span>
          </a>
        ))}
      </div>

      <div className="footer-details mt-2">
        {theme === 'web2' ? (
          <span className="console-hint">console.log("Open sesame")</span>
        ) : (
          <span className="group relative inline-block opacity-40 hover:opacity-80 transition-opacity">
            <DynamicIcon
              iconName="FaTerminal"
              className="inline-block cursor-pointer"
              size={14}
            />
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 -mt-2 -translate-y-full -translate-x-1/2 left-1/2 whitespace-nowrap">
              console.log("Open sesame")
            </div>
          </span>
        )}
      </div>
    </footer>
  );
};

const techBadges = [
  {
    name: 'React',
    url: 'https://react.dev/',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
    color: 'bg-blue-100 border-blue-400',
  },
  {
    name: 'Vite',
    url: 'https://vitejs.dev/',
    logo: 'https://vitejs.dev/logo.svg',
    color: 'bg-purple-100 border-purple-400',
  },
  {
    name: 'Tailwind',
    url: 'https://tailwindcss.com/',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg',
    color: 'bg-cyan-100 border-cyan-400',
  },
];

const getShortBio = bio => {
  if (!bio) return '';
  const normalized = bio.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 120) return normalized;
  return `${normalized.slice(0, 117)}...`;
};

const SuperFooter = () => {
  const { profile } = useProfileData();
  const shortBio = getShortBio(profile.bio);

  return (
    <footer className="relative bg-gradient-to-br from-white via-blue-50 to-cyan-50 border-t border-blue-200 shadow-inner mt-8 text-xs md:text-sm text-gray-700 dark:text-gray-300 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-2 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2 items-center md:items-start">
          {/* Mini Profile (Profile Pic + About Me) */}
          <div className="flex flex-col items-center md:items-start w-full mb-2">
            <img
              src={profile.profileImage}
              alt={`${profile.name} avatar`}
              className="w-16 h-16 rounded-full border-2 border-web2-primaryDark shadow-md mb-1"
            />
            <div className="text-base font-bold text-web2-primaryDark dark:text-blue-400">
              {profile.name}
            </div>
            {shortBio && (
              <div className="text-xs text-web2-text dark:text-gray-300 text-center md:text-left max-w-[220px]">
                {shortBio}
              </div>
            )}
          </div>
          {/* END Mini Profile */}
        </div>

        <div className="flex flex-col gap-4 items-center">
          <h5>Connect</h5>
          <div className="flex gap-3 items-center flex-col">
            <a
              href="https://luhsprwhk.beehiiv.com"
              target="_blank"
              rel="noopener noreferrer"
              className={clsx()}
            >
              Blog
            </a>
            <a
              href="https://github.com/luhsprwhk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            <a
              href="https://twitter.com/luhsprwhk"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com/in/luhsprwhk"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Sitemap, badges, webring */}
        <div className="flex flex-col gap-3 items-center md:items-center">
          <h5>Built with</h5>
          <div className="flex gap-2 items-center flex-col">
            {techBadges.map(badge => (
              <a
                key={badge.name}
                href={badge.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 px-2 py-1 rounded border ${badge.color}`}
                title={badge.name}
              >
                <img src={badge.logo} alt={badge.name} className="w-5 h-5" />
                <span className="font-bold">{badge.name}</span>
              </a>
            ))}
          </div>
          <hr className="my-4 border-gray-300 dark:border-gray-600 border-t-2 border-solid w-1/2 mx-auto" />
        </div>
      </div>
    </footer>
  );
};

export { Footer, SuperFooter };
export default Footer;
