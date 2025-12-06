import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
          background: '#FFFFFF',
          cardBg: '#F2F2F2',
          highlight: '#E6F7FF',
          divider: '#DDDDDD',
          debug: '#FF0000',
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
        csszen: {
          brown: {
            light: '#d3cbb8', // lighter brown/beige
            DEFAULT: '#9b8e70', // main brown
            dark: '#776b53', // darker brown
          },
          green: {
            light: '#e2eddf', // light sage
            DEFAULT: '#c0cba2', // main sage green
            dark: '#8fa061', // darker sage
          },
          cream: '#f8f7f3', // background cream
          accent: '#6d7e59', // accent green for links/highlights
        },
        christmas: {
          red: {
            light: '#d64456',
            DEFAULT: '#c41e3a',
            dark: '#a01629',
          },
          green: {
            light: '#146c43',
            DEFAULT: '#0f5132',
            dark: '#0a3622',
          },
          gold: {
            light: '#ffe44d',
            DEFAULT: '#ffd700',
            dark: '#ccac00',
          },
          white: '#fffafa',
          cream: '#fff8dc',
          silver: '#c0c0c0',
          pine: '#1b4d3e',
          burgundy: '#800020',
          frost: '#e6f7ff',
        },
      },
      fontFamily: {
        heading: ['"Raleway"', 'sans-serif'],
        body: ['"Roboto"', 'sans-serif'],
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
        'zengarden-serif': ['Georgia', 'Times New Roman', 'serif'],
        'zengarden-sans': ['Verdana', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s forwards',
        'slide-up': 'slideUp 0.5s forwards',
        'bounce-once': 'bounce 0.5s',
        pulse: 'pulse 2s infinite',
        'matrix-fall': 'matrix-fall linear infinite',
        ripple: 'ripple 0.6s linear',
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
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backgroundImage: {
        'zengarden-pattern': "url('/src/assets/zengarden-bg-pattern.png')",
        'zengarden-lotus': "url('/src/assets/zengarden-lotus.svg')",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['matrix', 'web2', 'csszen', 'christmas'],
      textColor: ['matrix', 'web2', 'csszen', 'christmas'],
      borderColor: ['matrix', 'web2', 'csszen', 'christmas'],
      dropShadow: ['matrix', 'web2', 'csszen', 'christmas'],
      boxShadow: {
        web2: '0 1px 3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
        'web2-hover':
          '0 1px 5px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      backgroundImage: {
        'web2-gradient': 'linear-gradient(to bottom, #33AADD, #0088CC)',
        'web2-button': 'linear-gradient(to bottom, #33AADD, #0088CC)',
        'web2-header': 'linear-gradient(to bottom, #FFFFFF, #F2F2F2)',
        'web2-card': 'linear-gradient(to bottom, #FFFFFF, #F9F9F9)',
      },
    },
  },
  plugins: [
    typography,
    function ({ addVariant }) {
      addVariant('matrix', '.matrix &');
      addVariant('web2', '.web2 &');
      addVariant('csszen', '.csszen &');
      addVariant('christmas', '.christmas &');
    },
  ],
};
