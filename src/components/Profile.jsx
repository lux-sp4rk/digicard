import profileImg from '../assets/profile.jpg';
import { BasicBio } from './ProfileBio';
import clsx from 'clsx';
import DynamicIcon from './DynamicIcon';
import styles from './Profile.module.css';
import { createThemeClassGetter } from './helpers/themeClassHelper';
import { PROFILE_DATA, BIO_TEXT } from '../constants/profileData';

const Profile = ({ theme }) => {
  // Profile data from constants
  const data = {
    name: PROFILE_DATA.name,
    location: PROFILE_DATA.location,
    profileImage: profileImg,
    bio: BIO_TEXT.default,
  };

  // Create theme class getter for this component's styles
  const getThemeClass = createThemeClassGetter(styles);

  return (
    <section
      className={clsx(
        'relative py-8 px-5',
        theme === 'web2' && 'pt-10 pb-44',
        styles.profileSection,
        theme === 'web2' && styles.profileSectionWeb2
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
              src={data.profileImage}
              alt="Profile"
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
          {data.name}
        </h1>
      )}
      {theme !== 'web2' && (
        <p
          className={clsx(
            'mb-4 flex justify-center items-center gap-1',
            styles.profileLocation,
            getThemeClass(theme, 'profileLocation')
          )}
        >
          <DynamicIcon iconName="FaMapMarkerAlt" /> {data.location}
        </p>
      )}

      <BasicBio theme={theme} bio={data.bio} />
    </section>
  );
};

export default Profile;
