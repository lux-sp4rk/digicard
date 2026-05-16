import type {
  ContentfulData,
  Project,
  Service,
  Skill,
  Profile,
  Settings,
  YouTubeVideo,
  SoundCloudTrack,
} from '../types';
import fallbackProjects from '../dev-data/projects.json';
import fallbackServices from '../dev-data/services.json';
import fallbackSkills from '../dev-data/skills.json';
import fallbackYouTube from '../dev-data/youtubeVideo.json';

let cachedData: ContentfulData | null = null;

export async function loadContent(): Promise<ContentfulData> {
  if (cachedData) return cachedData;

  try {
    const generated = await import('./generated/contentful.json');
    cachedData = generated.default as ContentfulData;
    return cachedData;
  } catch {
    // No generated data — fall back to dev data
    console.warn(
      '[data] No generated contentful.json found, using fallback data'
    );
  }

  // Build fallback data from dev-data
  const profile: Profile = {
    id: 'fallback',
    name: 'Luh Sprwhk',
    title: 'Agentic Engineer \u0026 Creative Technologist',
    location: 'The Internet',
    bio: 'Building autonomous systems and creative tools.',
    profileImage: '/avatar.jpg',
  };

  cachedData = {
    projects: (fallbackProjects as any[]).map((p, i) => ({
      id: p.id || `p${i}`,
      title: p.title,
      description: p.description,
      link: p.link || '#',
      imgNormal: p.imgNormal || '',
      imgWide: p.imgWide || '',
      alt: p.alt || p.title,
      order: p.order || i,
      active: p.active !== false,
      icon: p.icon || null,
    })) as Project[],
    services: (fallbackServices as any[]).map((s, i) => ({
      id: s.id || `s${i}`,
      title: s.title,
      subtitle: s.subtitle || '',
      description: s.description,
      icon: s.icon || null,
      order: s.order || i,
      active: s.active !== false,
    })) as Service[],
    skills: (fallbackSkills as any[]).map((s, i) => ({
      id: s.id || `sk${i}`,
      title: s.title,
      subtitle: s.subtitle || '',
      description: s.description,
      icon: s.icon || null,
      image: s.image || null,
      order: s.order || i,
      active: s.active !== false,
    })) as Skill[],
    profile,
    settings: {
      id: 'fallback',
      socialLinks: [
        {
          id: 'blog',
          name: 'Blog',
          url: 'https://luhsprwhk.beehiiv.com',
          icon: 'FaRssSquare',
          order: 0,
          active: true,
          disabled: false,
        },
        {
          id: 'github',
          name: 'GitHub',
          url: 'https://github.com/luhsprwhk',
          icon: 'FaGithub',
          order: 1,
          active: true,
          disabled: false,
        },
        {
          id: 'twitter',
          name: 'Twitter',
          url: 'https://twitter.com/luhsprwhk',
          icon: 'FaTwitter',
          order: 2,
          active: true,
          disabled: false,
        },
        {
          id: 'youtube',
          name: 'YouTube',
          url: 'https://youtube.com/@luhsprwhk',
          icon: 'FaYoutube',
          order: 3,
          active: true,
          disabled: false,
        },
      ],
    },
    youTubeVideo: fallbackYouTube as unknown as YouTubeVideo,
    soundCloudTrack: null,
  };

  return cachedData;
}

export function getProjects(data: ContentfulData): Project[] {
  const items =
    data.projects?.length > 0 ? data.projects : (fallbackProjects as any[]);
  return items
    .filter(p => p.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getServices(data: ContentfulData): Service[] {
  const items =
    data.services?.length > 0 ? data.services : (fallbackServices as any[]);
  return items
    .filter(s => s.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getSkills(data: ContentfulData): Skill[] {
  const items =
    data.skills?.length > 0 ? data.skills : (fallbackSkills as any[]);
  return items
    .filter(s => s.active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getProfile(data: ContentfulData): Profile {
  return (
    data.profile || {
      id: 'fallback',
      name: 'Luh Sprwhk',
      title: 'Agentic Engineer',
      location: '',
      bio: '',
      profileImage: '/avatar.jpg',
    }
  );
}

export function getSettings(data: ContentfulData): Settings {
  return data.settings || { id: 'fallback', socialLinks: [] };
}
