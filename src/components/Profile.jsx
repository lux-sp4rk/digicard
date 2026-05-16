import clsx from 'clsx';
import styles from './Profile.module.css';
import { createThemeClassGetter } from './helpers/themeClassHelper';
import { useProfileData } from '../hooks/useProfileData';
import { BIO_TEXT } from '../constants/profileData';
import LocationIndicator from './LocationIndicator';

const Profile = ({ theme }) => {
  const { profile } = useProfileData();

  // Create theme class getter for this component's styles
  const getThemeClass = createThemeClassGetter(styles);

  return (
    <section
      className={clsx(
        'relative py-8 px-5',
        theme === 'web2' && 'pt-10 pb-44',
        styles.profileSection,
        theme === 'web2' && styles.profileSectionWeb2,
        theme === 'xmas' && styles.profileSectionXmas
      )}
    >
      {/* Clouds BG at bottom */}
      {theme === 'web2' && (
        <div
          className={clsx(
            'absolute left-0 right-0 bottom-0 w-full h-24 pointer-events-none z-0',
            'clouds-bg'
          )}
          aria-hidden="true"
        ></div>
      )}

      <div
        className={clsx(
          'relative z-10',
          theme !== 'web2' && 'mb-5',
          theme === 'matrix'
            ? 'w-20 h-20 mx-auto'
            : theme === 'web2'
              ? 'w-40 h-40 mx-auto web2-reflection'
              : theme !== 'web2' && 'w-36 h-36 mx-auto'
        )}
      >
        {theme === 'web2' && (
          <div className="web2-profile-frame">
            <img
              src={profile.profileImage}
              alt={`${profile.name} avatar`}
              className={clsx('w-full h-full rounded-xl object-cover')}
            />
          </div>
        )}
        {theme !== 'web2' && (
          <div
            className={clsx(
              theme === 'matrix' ? 'w-20 h-20' : 'w-36 h-36',
              styles.profileImage,
              getThemeClass(theme, 'profileImage')
            )}
          >
            <img
              src={profile.profileImage}
              alt={`${profile.name} avatar`}
              className={clsx('w-full h-full', styles.profilePhoto)}
            />
          </div>
        )}
      </div>
      {theme === 'web2' && (
        <div className="text-center mt-4">
          <h1
            className="font-web2Heading text-3xl font-bold text-web2-primaryDark mb-1"
            style={{ textShadow: '0 1px 0 rgba(255,255,255,0.8)' }}
          >
            {profile.name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-web2-textLight font-web2 text-sm mb-3">
            <span>📍 Austin, TX</span>
          </div>
        </div>
      )}
      {theme !== 'web2' && (
        <h1
          className={clsx(
            'mb-1',
            styles.profileName,
            getThemeClass(theme, 'profileName')
          )}
        >
          {profile.name}
        </h1>
      )}

      {/* Location Indicator - under the name */}
      {theme !== 'web2' && <LocationIndicator theme={theme} />}

      {/* Bio section */}
      <p
        className={clsx(
          'text-lg min-h-[2em] w-full leading-relaxed tracking-wide',
          'web2:text-xl web2:text-web2-text web2:font-web2 web2:text-center web2:px-4',
          'matrix:text-matrix-glow',
          'flexoki:text-flexoki-text',
          'catppuccin:text-catppuccin-text'
        )}
      >
        {profile.bio ||
          (theme === 'matrix' ? BIO_TEXT.matrix : BIO_TEXT.fallback)}
      </p>

      {/* Web2 social badges */}
      {theme === 'web2' && (
        <div className="flex justify-center gap-3 mt-4 mb-2">
          <span className="web2-badge">NEW!</span>
          <span className="inline-flex items-center gap-1 bg-web2-success text-white font-web2 text-xs rounded-full px-3 py-1 shadow-md">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Verified
          </span>
          <span className="web2-rss-icon">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
              <path d="M5 7a1 1 0 000 2c3.314 0 6 2.686 6 6a1 1 0 102 0c0-4.418-3.582-8-8-8z" />
              <circle cx="5" cy="13" r="2" />
            </svg>
            RSS
          </span>
        </div>
      )}
    </section>
  );
};

export default Profile;
