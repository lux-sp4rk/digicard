import clsx from 'clsx';
import { BIO_TEXT } from '../constants/profileData';

const BasicBio = ({ theme, bio }) => {
  // Use provided bio or fall back to theme-specific defaults
  const displayBio =
    bio || (theme === 'matrix' ? BIO_TEXT.matrix : BIO_TEXT.fallback);

  return (
    <p
      className={clsx(
        'text-lg font-mono min-h-[2em] w-full',
        'web2:text-4xl web2:text-web2-secondary web2:font-web2Heading',
        'matrix:text-matrix-glow'
      )}
    >
      {displayBio}
    </p>
  );
};

export { BasicBio };
