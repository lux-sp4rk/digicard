import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,astro}', './public/**/*.html'],
  darkMode: 'class', // We'll use this for toggling dark/light theme
  theme: {
    extend: {
      colors: {
        web2: {
          primary: '#0088CC',
          primaryLight: '#33AADD',
          primaryDark: '#005580',
          secondary: '#F9F9F9',
          accent: '#FF9900',
          text: '#333333',
          textLight: '#666666',
          border: '#CCCCCC',
          success: '#66CC66',
          error: '#FF6666',
          background: '#E8EDF2',
          cardBg: '#FFFFFF',
          highlight: '#E6F7FF',
          divider: '#DDDDDD',
          debug: '#FF0000',
          glossyBlue: '#4A90E2',
          glossyHighlight: '#87CEEB',
          gradientStart: '#FFFFFF',
          gradientEnd: '#F0F4F8',
          shadowColor: 'rgba(0, 0, 0, 0.15)',
          innerGlow: 'rgba(255, 255, 255, 0.8)',
        },
        github: {
          white: '#ffffff',
          text: '#24292e',
          blue: '#0366d6',
          lightBlue: '#005cc5',
          gray: '#6a737d',
          lightGray: '#e1e4e8',
          green: '#22863a',
          bgGray: '#f6f8fa',
        },
        dracula: {
          background: '#282a36',
          currentLine: '#44475a',
          foreground: '#f8f8f2',
          comment: '#6272a4',
          cyan: '#8be9fd',
          green: '#50fa7b',
          orange: '#ffb86c',
          pink: '#ff79c6',
          purple: '#bd93f9',
          red: '#ff5555',
          yellow: '#f1fa8c',
        },
        matrix: {
          background: '#000000',
          text: '#00ff00',
          glow: '#0f0',
          dimText: '#003b00',
          highlight: '#00ff41',
          shadow: '#003b00',
          terminal: '#0D0208',
          rain: '#008F11',
        },
        xmas: {
          red: '#c41e3a',
          redLight: '#e63946',
          redDark: '#8b0000',
          green: '#165b33',
          greenLight: '#2d8659',
          greenDark: '#0f3823',
          gold: '#d4af37',
          goldLight: '#ffd700',
          goldDark: '#b8860b',
          white: '#fffafa',
          cream: '#f5f5dc',
          background: '#0f1c14',
          cardBg: '#1a2e1f',
          text: '#fffafa',
          textSecondary: '#c7d5ca',
          accent: '#ff6b6b',
          glow: '#ffd700',
        },
        catppuccin: {
          base: '#1e1e2e',
          text: '#cdd6f4',
          blue: '#89b4fa',
          surface: '#313244',
          crust: '#11111b',
          mantle: '#181825',
        },
        flexoki: {
          base: '#fffcf0',
          text: '#101010',
          cyan: '#24837b',
          gold: '#ad8301',
          surface: '#f2f0e5',
          crust: '#cecdc3',
        },
        rosepine: {
          base: '#faf4ed',
          text: '#575279',
          rose: '#d7827e',
          surface: '#fffaf3',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        web2: [
          '"Lucida Grande"',
          '"Segoe UI"',
          '"Trebuchet MS"',
          'Tahoma',
          'sans-serif',
        ],
        web2Heading: [
          '"Myriad Pro"',
          '"Segoe UI"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        web2Comic: ['"Comic Sans MS"', '"Comic Sans"', 'cursive', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s forwards',
        'slide-up': 'slideUp 0.5s forwards',
        'bounce-once': 'bounce 0.5s',
        pulse: 'pulse 2s infinite',
        'matrix-fall': 'matrix-fall linear infinite',
        ripple: 'ripple 0.6s linear',
        'web2-shimmer': 'web2Shimmer 2s infinite',
        'web2-bounce': 'web2Bounce 0.6s infinite',
        'web2-pulse': 'web2Pulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        bounce: {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
          '60%': {
            transform: 'translateY(-5px)',
          },
        },
        pulse: {
          '0%': {
            boxShadow: '0 0 0 0 rgba(52, 152, 219, 0.4)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(52, 152, 219, 0)',
          },
          '100%': {
            boxShadow: '0 0 0 0 rgba(52, 152, 219, 0)',
          },
        },
        'matrix-fall': {
          to: {
            transform: 'translateY(100vh)',
          },
        },
        ripple: {
          to: {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
        web2Shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        web2Bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        web2Pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['matrix', 'web2', 'xmas'],
      textColor: ['matrix', 'web2', 'xmas'],
      borderColor: ['matrix', 'web2', 'xmas'],
      dropShadow: ['matrix', 'web2', 'xmas'],
      boxShadow: {
        web2: '0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
        'web2-hover':
          '0 8px 25px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.15)',
        'web2-glossy':
          '0 1px 0 rgba(255,255,255,0.6) inset, 0 -1px 0 rgba(0,0,0,0.1) inset, 0 4px 8px rgba(0,0,0,0.2)',
        'web2-card':
          '0 2px 8px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
        'web2-button':
          '0 1px 0 rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(0,0,0,0.2) inset, 0 3px 6px rgba(0,0,0,0.2)',
        'web2-inner': 'inset 0 2px 4px rgba(0,0,0,0.15)',
        'web2-reflection': '0 20px 40px rgba(0,0,0,0.15)',
      },
      backgroundImage: {
        'web2-gradient': 'linear-gradient(to bottom, #4A90E2, #0088CC)',
        'web2-button': 'linear-gradient(to bottom, #5BA3F5, #0088CC)',
        'web2-button-hover': 'linear-gradient(to bottom, #6BB4FF, #33AADD)',
        'web2-header': 'linear-gradient(to bottom, #FFFFFF, #E8EDF2)',
        'web2-card': 'linear-gradient(to bottom, #FFFFFF, #F0F4F8)',
        'web2-card-glossy':
          'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,244,248,0.8) 50%, rgba(255,255,255,0.6) 100%)',
        'web2-shimmer':
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'web2-radial':
          'radial-gradient(ellipse at top, #FFFFFF 0%, #E8EDF2 100%)',
      },
    },
  },
  plugins: [
    typography,
    function ({ addVariant }) {
      addVariant('matrix', '.matrix &');
      addVariant('web2', '.web2 &');
      addVariant('xmas', '.xmas &');
      addVariant('catppuccin', '.catppuccin &');
      addVariant('flexoki', '.flexoki &');
      addVariant('rosepine', '.rosepine &');
    },
  ],
};
