export interface Project {
  id: string;
  title: string;
  description: string;
  descriptionRaw?: any;
  link: string;
  imgNormal: string;
  imgWide: string;
  alt: string;
  order: number;
  active: boolean;
  icon: string | null;
}

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionRaw?: any;
  icon: string | null;
  order: number;
  active: boolean;
}

export interface Skill {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  descriptionRaw?: any;
  icon: string | null;
  image: string | null;
  order: number;
  active: boolean;
}

export interface Profile {
  id: string;
  name: string;
  title: string;
  location: string;
  bio: string;
  profileImage: string;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
  active: boolean;
  disabled: boolean;
}

export interface Settings {
  id: string;
  blogArchiveUrl?: string;
  socialLinks: SocialLink[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: string;
  publishDate: string;
  active: boolean;
}

export interface SoundCloudTrack {
  id: string;
  title: string;
  description: string;
  url: string;
  publishDate: string;
  active: boolean;
}

export interface ContentfulData {
  projects: Project[];
  services: Service[];
  skills: Skill[];
  profile: Profile | null;
  settings: Settings | null;
  youTubeVideo: YouTubeVideo | null;
  soundCloudTrack: SoundCloudTrack | null;
}
