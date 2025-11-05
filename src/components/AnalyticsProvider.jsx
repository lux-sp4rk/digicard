import { useEffect } from 'react';

/**
 * @component AnalyticsProvider
 * @description A component that injects the Umami analytics script into the application.
 * It is designed to be modular and efficient, loading the script only when needed.
 * Umami is a privacy-focused, lightweight analytics solution.
 *
 * @returns {null} This component does not render any visible UI.
 */
const AnalyticsProvider = () => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Analytics disabled in development mode.');
      return;
    }

    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL;

    if (!websiteId || !scriptUrl) {
      console.warn(
        'Umami configuration not found. Analytics will be disabled.'
      );
      return;
    }

    /**
     * @function initUmami
     * @description Initializes the Umami tracking script. It checks for an existing script,
     * creates a new one if necessary, and configures it to load asynchronously.
     */
    const initUmami = () => {
      // Check if script is already loaded to prevent duplicates
      if (document.querySelector('#umami-tracker')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'umami-tracker';
      script.async = true;
      script.defer = true;
      script.src = scriptUrl;
      script.setAttribute('data-website-id', websiteId);

      document.head.appendChild(script);
    };

    // Load only after first user interaction for better performance
    const events = ['scroll', 'mousemove', 'touchstart'];
    const handleInteraction = () => {
      initUmami();
      // Remove listeners after first interaction
      events.forEach(event =>
        window.removeEventListener(event, handleInteraction)
      );
    };

    events.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true });
    });

    // Cleanup function to remove listeners if component unmounts before interaction
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  return null; // This component does not render anything
};

export default AnalyticsProvider;
