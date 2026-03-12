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
            : theme !== 'web2' && 'w-36 h-36 mx-auto'
        )}
      >
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
          'text-lg font-mono min-h-[2em] w-full',
          'web2:text-4xl web2:text-web2-secondary web2:font-web2Heading',
          'matrix:text-matrix-glow',
          'flexoki:text-flexoki-text',
          'rosepine:text-rosepine-text',
          'catppuccin:text-catppuccin-text'
        )}
      >
        {profile.bio ||
          (theme === 'matrix' ? BIO_TEXT.matrix : BIO_TEXT.fallback)}
      </p>
    </section>
  );
};

export default Profile;
