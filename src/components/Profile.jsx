import clsx from 'clsx';
import styles from './Profile.module.css';
import { createThemeClassGetter } from './helpers/themeClassHelper';
import { useProfileData } from '../hooks/useProfileData';
import { BIO_TEXT } from '../constants/profileData';
import LocationIndicator from './LocationIndicator';

const Web2HeroBackground = () => (
  <svg
    className={styles.web2HeroSvg}
    viewBox="0 0 800 600"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      {/* Glossy orb gradient */}
      <radialGradient id="orbGrad1" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="20%" stopColor="#aaddff" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#0088cc" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#004466" stopOpacity="1" />
      </radialGradient>
      <radialGradient id="orbGrad2" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="20%" stopColor="#ffcc00" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#ff9900" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#cc6600" stopOpacity="1" />
      </radialGradient>
      <radialGradient id="orbGrad3" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="20%" stopColor="#ccffcc" stopOpacity="0.8" />
        <stop offset="60%" stopColor="#44cc44" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#226622" stopOpacity="1" />
      </radialGradient>
      <linearGradient id="rssGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff9900" />
        <stop offset="100%" stopColor="#ff6600" />
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#1a4a7a" />
        <stop offset="30%" stopColor="#3a8bc7" />
        <stop offset="60%" stopColor="#87ceeb" />
        <stop offset="100%" stopColor="#b8dff8" />
      </linearGradient>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow
          dx="2"
          dy="3"
          stdDeviation="3"
          floodColor="#000"
          floodOpacity="0.3"
        />
      </filter>
    </defs>

    {/* Background base gradient — defs above, rect references it */}
    <rect width="800" height="600" fill="url(#bgGrad)" />

    {/* Floating glossy orbs */}
    <circle
      cx="80"
      cy="100"
      r="45"
      fill="url(#orbGrad1)"
      filter="url(#dropShadow)"
      opacity="0.85"
    >
      <animate
        attributeName="cy"
        values="100;120;100"
        dur="6s"
        repeatCount="indefinite"
      />
    </circle>
    <ellipse cx="80" cy="155" rx="35" ry="8" fill="#000" opacity="0.15">
      <animate
        attributeName="cy"
        values="155;175;155"
        dur="6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="rx"
        values="35;30;35"
        dur="6s"
        repeatCount="indefinite"
      />
    </ellipse>

    <circle
      cx="720"
      cy="80"
      r="55"
      fill="url(#orbGrad2)"
      filter="url(#dropShadow)"
      opacity="0.8"
    >
      <animate
        attributeName="cy"
        values="80;110;80"
        dur="7s"
        repeatCount="indefinite"
      />
    </circle>
    <ellipse cx="720" cy="145" rx="42" ry="10" fill="#000" opacity="0.15">
      <animate
        attributeName="cy"
        values="145;175;145"
        dur="7s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="rx"
        values="42;35;42"
        dur="7s"
        repeatCount="indefinite"
      />
    </ellipse>

    <circle
      cx="650"
      cy="180"
      r="35"
      fill="url(#orbGrad3)"
      filter="url(#dropShadow)"
      opacity="0.75"
    >
      <animate
        attributeName="cy"
        values="180;200;180"
        dur="5s"
        repeatCount="indefinite"
      />
    </circle>

    <circle
      cx="150"
      cy="220"
      r="30"
      fill="url(#orbGrad1)"
      filter="url(#dropShadow)"
      opacity="0.7"
    >
      <animate
        attributeName="cy"
        values="220;200;220"
        dur="8s"
        repeatCount="indefinite"
      />
    </circle>

    {/* Giant AJAX spinner / throbber */}
    <g transform="translate(400, 100)">
      <circle
        cx="0"
        cy="0"
        r="40"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeOpacity="0.2"
      />
      <path
        d="M 0,-40 A 40,40 0 0,1 40,0"
        fill="none"
        stroke="#ff9900"
        strokeWidth="8"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0"
          to="360"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
      <text
        x="0"
        y="65"
        textAnchor="middle"
        fontFamily="'Lucida Grande', sans-serif"
        fontSize="11"
        fontWeight="bold"
        fill="#ffffff"
        opacity="0.8"
      >
        LOADING...
      </text>
    </g>

    {/* BETA starbursts */}
    <g transform="translate(200, 60) rotate(-15)">
      <path
        d="M0,-50 L12,-12 L50,0 L12,12 L0,50 L-12,12 L-50,0 L-12,-12 Z"
        fill="#ff3333"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="18"
        fontWeight="bold"
        fill="#ffffff"
        letterSpacing="2"
      >
        BETA
      </text>
    </g>
    <g transform="translate(600, 140) rotate(25)">
      <path
        d="M0,-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10 Z"
        fill="#ff9900"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="14"
        fontWeight="bold"
        fill="#ffffff"
        letterSpacing="1"
      >
        NEW!
      </text>
    </g>
    <g transform="translate(100, 300) rotate(-8)">
      <path
        d="M0,-35 L8,-8 L35,0 L8,8 L0,35 L-8,8 L-35,0 L-8,-8 Z"
        fill="#33cc33"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="3"
        textAnchor="middle"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#ffffff"
      >
        AJAX
      </text>
    </g>

    {/* Oversized micro-badges (blown up to absurdity) */}
    <g transform="translate(120, 400)">
      <rect
        x="-60"
        y="-20"
        width="120"
        height="40"
        rx="4"
        fill="#4488cc"
        stroke="#225588"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <rect x="-58" y="-18" width="116" height="18" rx="2" fill="#66aadd" />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#ffffff"
      >
        VALID XHTML 1.0 STRICT
      </text>
    </g>
    <g transform="translate(680, 360) rotate(5)">
      <rect
        x="-55"
        y="-18"
        width="110"
        height="36"
        rx="4"
        fill="#ff6600"
        stroke="#cc4400"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <rect x="-53" y="-16" width="106" height="16" rx="2" fill="#ff8844" />
      <text
        x="0"
        y="3"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fontWeight="bold"
        fill="#ffffff"
      >
        GET FIREFOX
      </text>
    </g>
    <g transform="translate(250, 520) rotate(-3)">
      <rect
        x="-50"
        y="-16"
        width="100"
        height="32"
        rx="4"
        fill="#cc3399"
        stroke="#992266"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <rect x="-48" y="-14" width="96" height="14" rx="2" fill="#dd55aa" />
      <text
        x="0"
        y="2"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="8"
        fontWeight="bold"
        fill="#ffffff"
      >
        CSS POWERED
      </text>
    </g>
    <g transform="translate(550, 480) rotate(8)">
      <rect
        x="-50"
        y="-16"
        width="100"
        height="32"
        rx="4"
        fill="#669900"
        stroke="#446600"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <rect x="-48" y="-14" width="96" height="14" rx="2" fill="#88bb22" />
      <text
        x="0"
        y="2"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="8"
        fontWeight="bold"
        fill="#ffffff"
      >
        WEB 2.0 READY
      </text>
    </g>

    {/* RSS icons scattered */}
    <g transform="translate(300, 150) rotate(-20)" filter="url(#dropShadow)">
      <circle cx="-8" cy="8" r="6" fill="url(#rssGrad)" />
      <path
        d="M8,18 A 10,10 0 0,1 18,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8,28 A 20,20 0 0,1 28,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </g>
    <g
      transform="translate(500, 250) rotate(15) scale(0.8)"
      filter="url(#dropShadow)"
    >
      <circle cx="-8" cy="8" r="6" fill="url(#rssGrad)" />
      <path
        d="M8,18 A 10,10 0 0,1 18,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8,28 A 20,20 0 0,1 28,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </g>
    <g
      transform="translate(180, 200) rotate(-45) scale(1.2)"
      filter="url(#dropShadow)"
    >
      <circle cx="-8" cy="8" r="6" fill="url(#rssGrad)" />
      <path
        d="M8,18 A 10,10 0 0,1 18,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M8,28 A 20,20 0 0,1 28,8"
        fill="none"
        stroke="url(#rssGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </g>

    {/* Tag cloud debris */}
    <text
      x="350"
      y="320"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="28"
      fontWeight="bold"
      fill="#ff6600"
      opacity="0.9"
      transform="rotate(-5 350 320)"
      filter="url(#dropShadow)"
    >
      Folksonomy
    </text>
    <text
      x="480"
      y="200"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="20"
      fontWeight="bold"
      fill="#0088cc"
      opacity="0.85"
      transform="rotate(8 480 200)"
      filter="url(#dropShadow)"
    >
      Mashup
    </text>
    <text
      x="220"
      y="280"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="16"
      fill="#33aa33"
      opacity="0.8"
      transform="rotate(-12 220 280)"
    >
      Long Tail
    </text>
    <text
      x="580"
      y="300"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="24"
      fontWeight="bold"
      fill="#cc3399"
      opacity="0.9"
      transform="rotate(15 580 300)"
      filter="url(#dropShadow)"
    >
      Crowdsourcing
    </text>
    <text
      x="420"
      y="420"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="18"
      fill="#ff9900"
      opacity="0.85"
      transform="rotate(-8 420 420)"
    >
      Blogosphere
    </text>
    <text
      x="280"
      y="180"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="14"
      fill="#6666ff"
      opacity="0.75"
      transform="rotate(20 280 180)"
    >
      Tagging
    </text>
    <text
      x="650"
      y="250"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="22"
      fontWeight="bold"
      fill="#ff3333"
      opacity="0.85"
      transform="rotate(-18 650 250)"
      filter="url(#dropShadow)"
    >
      Widget
    </text>
    <text
      x="150"
      y="450"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="15"
      fill="#0088cc"
      opacity="0.8"
      transform="rotate(10 150 450)"
    >
      API
    </text>
    <text
      x="500"
      y="380"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="26"
      fontWeight="bold"
      fill="#ff6600"
      opacity="0.9"
      transform="rotate(-6 500 380)"
      filter="url(#dropShadow)"
    >
      Synergy
    </text>
    <text
      x="320"
      y="480"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="17"
      fill="#cc3399"
      opacity="0.85"
      transform="rotate(12 320 480)"
    >
      Ajax
    </text>
    <text
      x="450"
      y="160"
      fontFamily="'Comic Sans MS', 'Chalkboard', cursive"
      fontSize="13"
      fill="#33aa33"
      opacity="0.7"
      transform="rotate(-15 450 160)"
    >
      Web 3.0?
    </text>

    {/* Chat bubbles with era text */}
    <g transform="translate(500, 80)">
      <path
        d="M0,0 L120,0 L120,40 L20,40 L0,55 L10,40 L0,40 Z"
        fill="#ffffff"
        stroke="#cccccc"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <text
        x="60"
        y="24"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fill="#333333"
      >
        omg did u see my top 8?
      </text>
    </g>
    <g transform="translate(80, 380)">
      <path
        d="M0,0 L110,0 L110,35 L100,35 L110,48 L90,35 L0,35 Z"
        fill="#e6f3ff"
        stroke="#99ccff"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <text
        x="55"
        y="21"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fill="#0066cc"
      >
        poking u back! lol
      </text>
    </g>
    <g transform="translate(620, 420)">
      <path
        d="M0,0 L100,0 L100,30 L90,30 L100,42 L80,30 L0,30 Z"
        fill="#ffffff"
        stroke="#cccccc"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <text
        x="50"
        y="18"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="8"
        fill="#333333"
      >
        brb afk
      </text>
    </g>
    <g transform="translate(200, 120)">
      <path
        d="M0,0 L130,0 L130,35 L120,35 L130,48 L110,35 L0,35 Z"
        fill="#ffeecc"
        stroke="#ffcc66"
        strokeWidth="2"
        filter="url(#dropShadow)"
      />
      <text
        x="65"
        y="21"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fill="#cc6600"
      >
        ☹ Fail Whale
      </text>
    </g>

    {/* Digg button */}
    <g transform="translate(60, 180)">
      <rect
        x="0"
        y="0"
        width="70"
        height="24"
        rx="3"
        fill="#ffffff"
        stroke="#cccccc"
        strokeWidth="1"
        filter="url(#dropShadow)"
      />
      <rect x="0" y="0" width="28" height="24" rx="3" fill="#3b7ee3" />
      <text
        x="14"
        y="16"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#ffffff"
      >
        Digg
      </text>
      <text
        x="49"
        y="16"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fill="#333333"
      >
        It!
      </text>
    </g>

    {/* "Add to del.icio.us" */}
    <g transform="translate(60, 215)">
      <rect
        x="0"
        y="0"
        width="110"
        height="22"
        rx="2"
        fill="#3274d0"
        stroke="#2255aa"
        strokeWidth="1"
        filter="url(#dropShadow)"
      />
      <text
        x="55"
        y="15"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="9"
        fontWeight="bold"
        fill="#ffffff"
      >
        Add to del.icio.us
      </text>
    </g>

    {/* Giant 3D "e" (Internet Explorer reference) */}
    <g transform="translate(700, 500) rotate(-10)" filter="url(#dropShadow)">
      <text
        x="0"
        y="0"
        fontFamily="'Impact', sans-serif"
        fontSize="60"
        fontWeight="bold"
        fill="url(#orbGrad1)"
        stroke="#004466"
        strokeWidth="2"
      >
        e
      </text>
      <text
        x="2"
        y="2"
        fontFamily="'Impact', sans-serif"
        fontSize="60"
        fontWeight="bold"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1"
        opacity="0.5"
      >
        e
      </text>
    </g>

    {/* "W3C Valid" badge */}
    <g transform="translate(720, 280)">
      <rect
        x="-35"
        y="-18"
        width="70"
        height="36"
        rx="2"
        fill="#005a9c"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="-4"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="8"
        fontWeight="bold"
        fill="#ffffff"
      >
        W3C
      </text>
      <text
        x="0"
        y="8"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="7"
        fill="#aaddff"
      >
        VALID
      </text>
    </g>

    {/* "Powered by WordPress" */}
    <g transform="translate(90, 500) rotate(-5)">
      <rect
        x="-50"
        y="-14"
        width="100"
        height="28"
        rx="3"
        fill="#464646"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="8"
        fontWeight="bold"
        fill="#ffffff"
      >
        Powered by WordPress
      </text>
    </g>

    {/* "Subscribe via RSS" banner */}
    <g transform="translate(400, 550)">
      <rect
        x="-70"
        y="-14"
        width="140"
        height="28"
        rx="3"
        fill="#ff6600"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontFamily="'Arial', sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#ffffff"
      >
        ☊ SUBSCRIBE VIA RSS
      </text>
    </g>

    {/* Floating star ratings */}
    <g transform="translate(580, 120)">
      <text
        x="0"
        y="0"
        fontFamily="'Arial', sans-serif"
        fontSize="16"
        fill="#ffcc00"
        filter="url(#dropShadow)"
      >
        ★★★★★
      </text>
    </g>

    {/* "Under Construction" tape */}
    <g transform="translate(150, 50) rotate(15)">
      <rect
        x="-70"
        y="-10"
        width="140"
        height="20"
        fill="#ffcc00"
        stroke="#ff9900"
        strokeWidth="1"
        filter="url(#dropShadow)"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        fontFamily="'Arial Black', sans-serif"
        fontSize="10"
        fontWeight="bold"
        fill="#000000"
      >
        UNDER CONSTRUCTION
      </text>
    </g>
  </svg>
);

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
      {/* Satirical Web2 Hero BG */}
      {theme === 'web2' && (
        <div
          className={clsx(
            'absolute inset-0 w-full h-full pointer-events-none z-0'
          )}
          aria-hidden="true"
        >
          <Web2HeroBackground />
        </div>
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
        <div className="relative z-20 bg-white/80 backdrop-blur-sm rounded-xl px-6 py-4 mx-4 mt-2 shadow-lg border border-white/60">
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
