import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock setup ──────────────────────────────────────────────────────────────
// Use vi.hoisted() to ensure mock variables are hoisted alongside vi.mock()
// This fixes issues with pool: 'forks' in CI where vi.mock() is hoisted but
// regular variable declarations are not.

const { mockGetEntries } = vi.hoisted(() => ({
  mockGetEntries: vi.fn(),
}));

vi.mock('contentful', () => ({
  createClient: vi.fn(() => ({
    getEntries: mockGetEntries,
  })),
}));

// Mock import.meta.env before the module is imported
vi.stubEnv('VITE_CONTENTFUL_SPACE_ID', 'test-space');
vi.stubEnv('VITE_CONTENTFUL_ACCESS_TOKEN', 'test-token');

// Now import the functions under test (after mocks are in place)
const {
  getServices,
  getProjects,
  getBlogPosts,
  getFeaturedPost,
  getProfile,
  getSettings,
  getSocialLinks,
  getYouTubeVideo,
  getSoundCloudTrack,
  getSkills,
  getBio,
} = await import('../../src/utils/contentful');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeServiceItem = ({
  id = 'sys-id-1',
  title = 'Test Service',
  subtitle = 'A subtitle',
  description = 'A description',
  icon = 'FaCode',
  order = 1,
  active = true,
} = {}) => ({
  sys: { id },
  fields: { title, subtitle, description, icon, order, active },
});

const makeProjectItem = ({
  id = 'sys-id-1',
  title = 'Test Project',
  description = 'A test project',
  link = 'https://example.com',
  image = null,
  imageWide = null,
  alt = 'Test alt',
  order = 1,
  active = true,
  icon = null,
} = {}) => ({
  sys: { id },
  fields: {
    title,
    description,
    link,
    alt,
    order,
    active,
    icon,
    image: image || {
      fields: { file: { url: '//images.ctfassets.net/test.jpg' } },
    },
    imageWide: imageWide || {
      fields: { file: { url: '//images.ctfassets.net/test-wide.jpg' } },
    },
  },
});

const makeBlogPostItem = ({
  id = 'blog-1',
  title = 'Test Blog Post',
  description = 'A test blog post',
  content = 'Blog content here',
  link = 'https://blog.example.com',
  image = null,
  publishDate = '2024-01-15',
  featured = false,
} = {}) => ({
  sys: { id },
  fields: {
    title,
    description,
    content,
    link,
    publishDate,
    featured,
    image: image || {
      fields: { file: { url: '//images.ctfassets.net/blog.jpg' } },
    },
  },
});

const makeProfileItem = ({
  id = 'profile-1',
  name = 'John Doe',
  title = 'Developer',
  location = 'Remote',
  bio = 'A passionate developer',
  profileImage = null,
} = {}) => ({
  sys: { id },
  fields: {
    name,
    title,
    location,
    bio,
    profileImage: profileImage || {
      fields: { file: { url: '//images.ctfassets.net/profile.jpg' } },
    },
  },
});

const makeSettingsItem = ({
  id = 'settings-1',
  blogArchiveUrl = 'https://blog.example.com',
  socialLinks = {},
} = {}) => ({
  sys: { id },
  fields: { blogArchiveUrl, socialLinks },
});

const makeYouTubeVideoItem = ({
  id = 'video-1',
  title = 'Test Video',
  description = 'A test video',
  url = 'https://youtube.com/watch?v=abc123',
  thumbnail = null,
  duration = '10:00',
  publishDate = '2024-01-15',
  active = true,
} = {}) => ({
  sys: { id },
  fields: {
    title,
    description,
    url,
    duration,
    publishDate,
    active,
    thumbnail: thumbnail || {
      fields: { file: { url: '//images.ctfassets.net/thumb.jpg' } },
    },
  },
});

const makeSoundCloudTrackItem = ({
  id = 'track-1',
  title = 'Test Track',
  description = 'A test track',
  url = 'https://soundcloud.com/user/track',
  publishDate = '2024-01-15',
  active = true,
} = {}) => ({
  sys: { id },
  fields: { title, description, url, publishDate, active },
});

const makeSkillItem = ({
  id = 'skill-1',
  title = 'React',
  subtitle = 'Frontend Framework',
  description = 'A JavaScript library for building UIs',
  icon = 'FaReact',
  order = 1,
  active = true,
} = {}) => ({
  sys: { id },
  fields: { title, subtitle, description, icon, order, active },
});

// ─── Tests: getServices ──────────────────────────────────────────────────────

describe('getServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mapped array of services from Contentful', async () => {
    const rawItem = makeServiceItem({ id: 'abc123', title: 'My Service' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'abc123',
      title: 'My Service',
      subtitle: 'A subtitle',
      description: 'A description',
      icon: 'FaCode',
      order: 1,
      active: true,
    });
  });

  it('passes correct content_type and order to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getServices();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'service',
      order: 'fields.order',
      include: 3,
    });
  });

  it('defaults icon to null when not provided', async () => {
    const rawItem = makeServiceItem({ icon: undefined });
    rawItem.fields.icon = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].icon).toBeNull();
  });

  it('defaults subtitle to empty string when not provided', async () => {
    const rawItem = makeServiceItem({ subtitle: undefined });
    rawItem.fields.subtitle = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].subtitle).toBe('');
  });

  it('defaults order to 0 when not provided', async () => {
    const rawItem = makeServiceItem();
    rawItem.fields.order = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].order).toBe(0);
  });

  it('defaults active to true when not provided', async () => {
    const rawItem = makeServiceItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getServices();

    expect(result[0].active).toBe(true);
  });

  it('returns empty array when Contentful returns no items', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getServices();

    expect(result).toEqual([]);
  });

  it('returns empty array and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getServices();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('maps multiple items preserving all fields', async () => {
    const items = [
      makeServiceItem({ id: 'id1', title: 'Alpha', order: 2 }),
      makeServiceItem({ id: 'id2', title: 'Beta', order: 1 }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getServices();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('id1');
    expect(result[1].id).toBe('id2');
  });

  it('falls back to plural content_type on unknownContentType error', async () => {
    const errorSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockResolvedValueOnce({ items: [makeServiceItem({ id: 'plural-id' })] });

    const result = await getServices();

    expect(result[0].id).toBe('plural-id');
    expect(mockGetEntries).toHaveBeenNthCalledWith(2, {
      content_type: 'services',
      order: 'fields.order',
      include: 3,
    });

    errorSpy.mockRestore();
  });

  it('tries without order when ordering fails', async () => {
    mockGetEntries
      .mockRejectedValueOnce(new Error('some ordering error'))
      .mockResolvedValueOnce({ items: [makeServiceItem({ id: 'no-order' })] });

    const result = await getServices();

    expect(result[0].id).toBe('no-order');
  });
});

// ─── Tests: getProjects ──────────────────────────────────────────────────────

describe('getProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mapped array of projects from Contentful', async () => {
    const rawItem = makeProjectItem({ id: 'proj-1', title: 'My Project' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'proj-1',
      title: 'My Project',
      description: 'A test project',
      link: 'https://example.com',
      imgNormal: '//images.ctfassets.net/test.jpg',
      imgWide: '//images.ctfassets.net/test-wide.jpg',
      alt: 'Test alt',
      order: 1,
      active: true,
      icon: null,
    });
  });

  it('passes correct content_type and order to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getProjects();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'project',
      order: 'fields.order',
      include: 3,
    });
  });

  it('falls back to plural content_type on unknownContentType error', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockResolvedValueOnce({
        items: [makeProjectItem({ id: 'plural-proj' })],
      });

    const result = await getProjects();

    expect(result[0].id).toBe('plural-proj');
    expect(mockGetEntries).toHaveBeenNthCalledWith(2, {
      content_type: 'projects',
      order: 'fields.order',
      include: 3,
    });

    errorSpy.mockRestore();
  });

  it('throws error when both singular and plural fail', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockRejectedValueOnce(new Error('API failure'));

    await expect(getProjects()).rejects.toThrow('unknownContentType');

    errorSpy.mockRestore();
  });

  it('defaults alt to title when not provided', async () => {
    const rawItem = makeProjectItem({ alt: undefined });
    rawItem.fields.alt = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result[0].alt).toBe('Test Project');
  });

  it('defaults order to 0 when not provided', async () => {
    const rawItem = makeProjectItem();
    rawItem.fields.order = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result[0].order).toBe(0);
  });

  it('defaults active to true when not specified', async () => {
    const rawItem = makeProjectItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result[0].active).toBe(true);
  });

  it('sets active to false when explicitly false', async () => {
    const rawItem = makeProjectItem({ active: false });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result[0].active).toBe(false);
  });

  it('returns empty string for image URLs when image is missing', async () => {
    const rawItem = makeProjectItem();
    rawItem.fields.image = null;
    rawItem.fields.imageWide = null;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProjects();

    expect(result[0].imgNormal).toBe('');
    expect(result[0].imgWide).toBe('');
  });

  it('maps multiple projects preserving all fields', async () => {
    const items = [
      makeProjectItem({ id: 'proj-1', title: 'Alpha', order: 2 }),
      makeProjectItem({ id: 'proj-2', title: 'Beta', order: 1 }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getProjects();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('proj-1');
    expect(result[1].id).toBe('proj-2');
  });
});

// ─── Tests: getBlogPosts ─────────────────────────────────────────────────────

describe('getBlogPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mapped array of blog posts from Contentful', async () => {
    const rawItem = makeBlogPostItem({ id: 'post-1', title: 'My Post' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'post-1',
      title: 'My Post',
      description: 'A test blog post',
      content: 'Blog content here',
      link: 'https://blog.example.com',
      publishDate: '2024-01-15',
      featured: false,
    });
  });

  it('passes correct content_type and order to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getBlogPosts();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'blogPost',
      order: '-fields.publishDate',
      include: 3,
    });
  });

  it('returns empty array when no items are found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getBlogPosts();

    expect(result).toEqual([]);
  });

  it('returns empty array and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getBlogPosts();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching blog posts:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('defaults featured to false when not provided', async () => {
    const rawItem = makeBlogPostItem();
    rawItem.fields.featured = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getBlogPosts();

    expect(result[0].featured).toBe(false);
  });

  it('returns empty string for image URL when image is missing', async () => {
    const rawItem = makeBlogPostItem();
    rawItem.fields.image = null;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getBlogPosts();

    expect(result[0].image).toBe('');
  });

  it('maps multiple blog posts', async () => {
    const items = [
      makeBlogPostItem({ id: 'post-1', title: 'First Post' }),
      makeBlogPostItem({ id: 'post-2', title: 'Second Post' }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('First Post');
    expect(result[1].title).toBe('Second Post');
  });
});

// ─── Tests: getFeaturedPost ──────────────────────────────────────────────────

describe('getFeaturedPost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a single featured post when found', async () => {
    const rawItem = makeBlogPostItem({
      id: 'featured-1',
      title: 'Featured Post',
      featured: true,
    });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getFeaturedPost();

    expect(result).toMatchObject({
      id: 'featured-1',
      title: 'Featured Post',
      description: 'A test blog post',
      content: 'Blog content here',
      link: 'https://blog.example.com',
      publishDate: '2024-01-15',
    });
  });

  it('queries with featured=true filter', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getFeaturedPost();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'blogPost',
      'fields.featured': true,
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no featured post is found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getFeaturedPost();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getFeaturedPost();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching featured post:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('returns only the first item when multiple featured posts exist', async () => {
    const items = [
      makeBlogPostItem({ id: 'first', title: 'First Featured' }),
      makeBlogPostItem({ id: 'second', title: 'Second Featured' }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getFeaturedPost();

    expect(result.id).toBe('first');
  });
});

// ─── Tests: getProfile ───────────────────────────────────────────────────────

describe('getProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped profile data when found', async () => {
    const rawItem = makeProfileItem({ id: 'profile-1', name: 'Jane Doe' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProfile();

    expect(result).toEqual({
      id: 'profile-1',
      name: 'Jane Doe',
      title: 'Developer',
      location: 'Remote',
      bio: 'A passionate developer',
      profileImage: '//images.ctfassets.net/profile.jpg',
    });
  });

  it('passes correct content_type and limit to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getProfile();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'profile',
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no profile is found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getProfile();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getProfile();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching profile:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('returns empty string for profileImage when image is missing', async () => {
    const rawItem = makeProfileItem();
    rawItem.fields.profileImage = null;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getProfile();

    expect(result.profileImage).toBe('');
  });
});

// ─── Tests: getSettings ──────────────────────────────────────────────────────

describe('getSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped settings data when found', async () => {
    const rawItem = makeSettingsItem({
      id: 'settings-1',
      blogArchiveUrl: 'https://blog.example.com/archive',
      socialLinks: {
        twitter: { url: 'https://twitter.com/test', label: 'Twitter' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSettings();

    expect(result).toEqual({
      id: 'settings-1',
      blogArchiveUrl: 'https://blog.example.com/archive',
      socialLinks: {
        twitter: { url: 'https://twitter.com/test', label: 'Twitter' },
      },
    });
  });

  it('passes correct content_type and limit to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getSettings();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'settings',
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no settings are found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getSettings();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getSettings();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching settings:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('defaults socialLinks to empty object when not provided', async () => {
    const rawItem = makeSettingsItem();
    rawItem.fields.socialLinks = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSettings();

    expect(result.socialLinks).toEqual({});
  });
});

// ─── Tests: getSocialLinks ───────────────────────────────────────────────────

describe('getSocialLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts settings.socialLinks to array format', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        twitter: {
          url: 'https://twitter.com/test',
          label: 'Twitter',
          icon: 'FaTwitter',
          order: 1,
        },
        github: {
          url: 'https://github.com/test',
          label: 'GitHub',
          icon: 'FaGithub',
          order: 2,
        },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: 'twitter',
      name: 'Twitter',
      url: 'https://twitter.com/test',
      icon: 'FaTwitter',
      order: 1,
      active: true,
      disabled: false,
    });
  });

  it('sorts social links by order', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        github: { url: 'https://github.com', label: 'GitHub', order: 2 },
        twitter: { url: 'https://twitter.com', label: 'Twitter', order: 1 },
        linkedin: { url: 'https://linkedin.com', label: 'LinkedIn', order: 3 },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].id).toBe('twitter');
    expect(result[1].id).toBe('github');
    expect(result[2].id).toBe('linkedin');
  });

  it('uses index as order when order is not specified', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        first: { url: 'https://first.com', label: 'First' },
        second: { url: 'https://second.com', label: 'Second' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].order).toBe(0);
    expect(result[1].order).toBe(1);
  });

  it('defaults icon to FaExternalLinkAlt when not specified', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        custom: { url: 'https://custom.com', label: 'Custom' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].icon).toBe('FaExternalLinkAlt');
  });

  it('defaults name to key when label is not specified', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        mylink: { url: 'https://example.com' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].name).toBe('mylink');
  });

  it('uses href as fallback for url', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        oldlink: { href: 'https://old.example.com', label: 'Old Link' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].url).toBe('https://old.example.com');
  });

  it('returns empty array when settings is null', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getSocialLinks();

    expect(result).toEqual([]);
  });

  it('returns empty array when socialLinks is empty', async () => {
    const settingsItem = makeSettingsItem({ socialLinks: {} });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result).toEqual([]);
  });

  it('handles disabled flag correctly', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        disabled: {
          url: 'https://disabled.com',
          label: 'Disabled',
          disabled: true,
        },
        enabled: {
          url: 'https://enabled.com',
          label: 'Enabled',
          disabled: false,
        },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].disabled).toBe(true);
    expect(result[1].disabled).toBe(false);
  });

  it('defaults active to true when not specified', async () => {
    const settingsItem = makeSettingsItem({
      socialLinks: {
        active: { url: 'https://active.com', label: 'Active', active: true },
        notset: { url: 'https://notset.com', label: 'Not Set' },
      },
    });
    mockGetEntries.mockResolvedValueOnce({ items: [settingsItem] });

    const result = await getSocialLinks();

    expect(result[0].active).toBe(true);
    expect(result[1].active).toBe(true);
  });

  it('returns empty array and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getSocialLinks();

    expect(result).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});

// ─── Tests: getYouTubeVideo ──────────────────────────────────────────────────

describe('getYouTubeVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped YouTube video data when found', async () => {
    const rawItem = makeYouTubeVideoItem({ id: 'video-1', title: 'My Video' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getYouTubeVideo();

    expect(result).toMatchObject({
      id: 'video-1',
      title: 'My Video',
      description: 'A test video',
      url: 'https://youtube.com/watch?v=abc123',
      thumbnail: '//images.ctfassets.net/thumb.jpg',
      duration: '10:00',
      publishDate: '2024-01-15',
      active: true,
    });
  });

  it('passes correct content_type and limit to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getYouTubeVideo();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'youtubeVideo',
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no video is found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getYouTubeVideo();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getYouTubeVideo();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching YouTube video:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('returns empty string for thumbnail when image is missing', async () => {
    const rawItem = makeYouTubeVideoItem();
    rawItem.fields.thumbnail = null;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getYouTubeVideo();

    expect(result.thumbnail).toBe('');
  });

  it('defaults active to true when not specified', async () => {
    const rawItem = makeYouTubeVideoItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getYouTubeVideo();

    expect(result.active).toBe(true);
  });

  it('sets active to false when explicitly false', async () => {
    const rawItem = makeYouTubeVideoItem({ active: false });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getYouTubeVideo();

    expect(result.active).toBe(false);
  });
});

// ─── Tests: getSoundCloudTrack ───────────────────────────────────────────────

describe('getSoundCloudTrack', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mapped SoundCloud track data when found', async () => {
    const rawItem = makeSoundCloudTrackItem({
      id: 'track-1',
      title: 'My Track',
    });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSoundCloudTrack();

    expect(result).toMatchObject({
      id: 'track-1',
      title: 'My Track',
      description: 'A test track',
      url: 'https://soundcloud.com/user/track',
      publishDate: '2024-01-15',
      active: true,
    });
  });

  it('passes correct content_type and limit to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getSoundCloudTrack();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'soundCloudTrack',
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no track is found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getSoundCloudTrack();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getSoundCloudTrack();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching SoundCloud track:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });

  it('defaults active to true when not specified', async () => {
    const rawItem = makeSoundCloudTrackItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSoundCloudTrack();

    expect(result.active).toBe(true);
  });

  it('sets active to false when explicitly false', async () => {
    const rawItem = makeSoundCloudTrackItem({ active: false });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSoundCloudTrack();

    expect(result.active).toBe(false);
  });
});

// ─── Tests: getSkills ────────────────────────────────────────────────────────

describe('getSkills', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a mapped array of skills from Contentful', async () => {
    const rawItem = makeSkillItem({ id: 'skill-1', title: 'React' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSkills();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'skill-1',
      title: 'React',
      subtitle: 'Frontend Framework',
      description: 'A JavaScript library for building UIs',
      icon: 'FaReact',
      order: 1,
      active: true,
    });
  });

  it('tries multiple content type IDs in order', async () => {
    // First call with '6iJCkjpxHxeOEeic4bVobd' fails
    mockGetEntries.mockRejectedValueOnce(new Error('unknownContentType'));
    // Second call with 'skill' succeeds
    mockGetEntries.mockResolvedValueOnce({
      items: [makeSkillItem({ id: 'skill-id' })],
    });

    const result = await getSkills();

    expect(mockGetEntries).toHaveBeenCalledTimes(2);
    expect(mockGetEntries).toHaveBeenNthCalledWith(1, {
      content_type: '6iJCkjpxHxeOEeic4bVobd',
      order: 'fields.order',
      include: 3,
    });
    expect(mockGetEntries).toHaveBeenNthCalledWith(2, {
      content_type: 'skill',
      order: 'fields.order',
      include: 3,
    });
    expect(result[0].id).toBe('skill-id');
  });

  it('falls back to third ID if first two fail', async () => {
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockResolvedValueOnce({ items: [makeSkillItem({ id: 'skills-id' })] });

    const result = await getSkills();

    expect(mockGetEntries).toHaveBeenCalledTimes(3);
    expect(mockGetEntries).toHaveBeenNthCalledWith(3, {
      content_type: 'skills',
      order: 'fields.order',
      include: 3,
    });
    expect(result[0].id).toBe('skills-id');
  });

  it('throws error when all content type IDs fail', async () => {
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockRejectedValueOnce(new Error('unknownContentType'));

    await expect(getSkills()).rejects.toThrow(
      'Skills content type not found in Contentful'
    );
  });

  it('tries without order when ordering fails', async () => {
    mockGetEntries
      .mockRejectedValueOnce(new Error('unknownContentType'))
      .mockRejectedValueOnce(new Error('some ordering error'))
      .mockResolvedValueOnce({ items: [makeSkillItem({ id: 'no-order' })] });

    const result = await getSkills();

    expect(mockGetEntries).toHaveBeenNthCalledWith(3, {
      content_type: 'skill',
      include: 3,
    });
    expect(result[0].id).toBe('no-order');
  });

  it('defaults subtitle to empty string when not provided', async () => {
    const rawItem = makeSkillItem();
    rawItem.fields.subtitle = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSkills();

    expect(result[0].subtitle).toBe('');
  });

  it('defaults icon to null when not provided', async () => {
    const rawItem = makeSkillItem();
    rawItem.fields.icon = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSkills();

    expect(result[0].icon).toBeNull();
  });

  it('defaults order to 0 when not provided', async () => {
    const rawItem = makeSkillItem();
    rawItem.fields.order = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSkills();

    expect(result[0].order).toBe(0);
  });

  it('defaults active to true when not specified', async () => {
    const rawItem = makeSkillItem();
    rawItem.fields.active = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getSkills();

    expect(result[0].active).toBe(true);
  });

  it('maps multiple skills preserving all fields', async () => {
    const items = [
      makeSkillItem({ id: 'skill-1', title: 'React', order: 2 }),
      makeSkillItem({ id: 'skill-2', title: 'Vue', order: 1 }),
    ];
    mockGetEntries.mockResolvedValueOnce({ items });

    const result = await getSkills();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('React');
    expect(result[1].title).toBe('Vue');
  });
});

// ─── Tests: getBio ───────────────────────────────────────────────────────────

describe('getBio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns bio from profile when found', async () => {
    const rawItem = makeProfileItem({ bio: 'This is my bio' });
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getBio();

    expect(result).toBe('This is my bio');
  });

  it('passes correct content_type and limit to getEntries', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    await getBio();

    expect(mockGetEntries).toHaveBeenCalledWith({
      content_type: 'profile',
      limit: 1,
      include: 3,
    });
  });

  it('returns null when no profile is found', async () => {
    mockGetEntries.mockResolvedValueOnce({ items: [] });

    const result = await getBio();

    expect(result).toBeNull();
  });

  it('returns null when profile has no bio', async () => {
    const rawItem = makeProfileItem();
    rawItem.fields.bio = undefined;
    mockGetEntries.mockResolvedValueOnce({ items: [rawItem] });

    const result = await getBio();

    expect(result).toBeNull();
  });

  it('returns null and logs error on Contentful failure', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEntries.mockRejectedValueOnce(new Error('API failure'));

    const result = await getBio();

    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      'Error fetching bio:',
      expect.any(Error)
    );

    errorSpy.mockRestore();
  });
});
