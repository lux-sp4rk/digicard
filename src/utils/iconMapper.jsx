import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaMapMarkerAlt,
  FaArrowRight,
  FaExternalLinkAlt,
  FaDownload,
  FaPlay,
  FaTerminal,
  FaRssSquare,
  FaCoffee,
  FaTiktok,
  FaUserShield,
  FaUserTie,
  FaLifeRing,
  FaRobot,
  FaBrain,
  FaCode,
  FaProjectDiagram,
  FaCloudUploadAlt,
  FaBriefcase,
  FaUsers,
} from 'react-icons/fa';

import { FaThreads, FaMugHot, FaX } from 'react-icons/fa6';

// No SimpleIcons currently used

// Icon mapping object
const iconMap = {
  // FontAwesome icons
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaMapMarkerAlt,
  FaArrowRight,
  FaExternalLinkAlt,
  FaDownload,
  FaPlay,
  FaTerminal,
  FaRssSquare,
  FaCoffee,
  FaBriefcase,
  FaUsers,

  // FontAwesome 6
  FaThreads,
  FaMugHot,
  FaX,
  FaTiktok,
  FaUserShield,
  FaUserTie,
  FaLifeRing,
  FaRobot,
  FaBrain,
  FaCode,
  FaProjectDiagram,
  FaCloudUploadAlt,
};

export const getIcon = iconName => {
  return iconMap[iconName] || null;
};

export const renderIcon = (iconName, props = {}) => {
  const IconComponent = getIcon(iconName);
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in icon map`);
    return null;
  }
  return <IconComponent {...props} />;
};

export const getAvailableIcons = () => {
  return Object.keys(iconMap);
};
