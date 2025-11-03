const matrixBio = 'Welcome to the Matrix, hacker. Reality is what you make it.';

const BasicBio = ({ theme, bio }) => {
  // Use provided bio or fall back to default
  const displayBio = bio || (theme === 'matrix' ? matrixBio : bio);

  return (
    <p
      className="text-lg font-mono min-h-[2em] 
        web2:text-4xl 
        web2:text-web2-secondary matrix:text-matrix-glow w-full
        web2:font-web2Heading"
    >
      {displayBio}
    </p>
  );
};

export { BasicBio };
