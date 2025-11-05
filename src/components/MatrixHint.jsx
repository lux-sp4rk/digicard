import { useState, useRef, useLayoutEffect } from 'react';

function MatrixHint({ children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasTracked, setHasTracked] = useState(false);
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    if (showTooltip && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      // Track first hover only (start of easter egg funnel)
      if (!hasTracked) {
        try {
          window.umami?.track('easter-egg-hint-hovered');
        } catch (e) {
          console.warn('Analytics tracking failed:', e);
        }
        setHasTracked(true);
      }

      // Adjust position if tooltip goes beyond viewport edges
      if (rect.left < 0) {
        tooltip.style.left = '0';
        tooltip.style.transform = 'none';
      } else if (rect.right > viewportWidth) {
        tooltip.style.left = 'auto';
        tooltip.style.right = '0';
        tooltip.style.transform = 'none';
      }
    }
  }, [showTooltip, hasTracked]);

  return (
    <span
      className="inline-block animate-pulse hover:animate-bounce transition-all duration-300 cursor-pointer relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      aria-label="Seek the console's hidden path..."
    >
      {children}
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute bottom-full right-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 min-w-max"
        >
          Seek the console's hidden path...
        </div>
      )}
    </span>
  );
}

export default MatrixHint;
