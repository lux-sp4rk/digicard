import { createClient } from 'contentful';

/**
 * Normalizes a URL by ensuring it has a protocol.
 * If the URL starts with //, it's already protocol-relative.
 * If it starts with http:// or https://, it's already absolute.
 * Otherwise, prepends https:// to make it absolute.
 */
const normalizeUrl = url => {
  if (!url || typeof url !== 'string') return url;
  if (url.match(/^https?:\/\//) || url.startsWith('//')) {
    return url;
  }
  return `https://${url}`;
};

const client = createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

export const getProjects = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'project',
      order: 'fields.order',
      include: 3,
    });
    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      description: item.fields.description,
      link: normalizeUrl(item.fields.link),
      imgNormal: item.fields.image?.fields?.file?.url || '',
      imgWide: item.fields.imageWide?.fields?.file?.url || '',
      alt: item.fields.alt || item.fields.title,
      order: item.fields.order || 0,
      active: item.fields.active !== false, // Default to true if not specified
      icon: item.fields.icon || null,
    }));
  } catch (error) {
    // If singular fails, try plural
    if (error.message?.includes('unknownContentType')) {
      try {
        const response = await client.getEntries({
          content_type: 'projects',
          order: 'fields.order',
          include: 3,
        });
        return response.items.map(item => ({
          id: item.sys.id,
          title: item.fields.title,
          description: item.fields.description,
          link: normalizeUrl(item.fields.link),
          imgNormal: item.fields.image?.fields?.file?.url || '',
          imgWide: item.fields.imageWide?.fields?.file?.url || '',
          alt: item.fields.alt || item.fields.title,
          order: item.fields.order || 0,
          active: item.fields.active !== false,
          icon: item.fields.icon || null,
        }));
      } catch (innerError) {
        console.error('Error fetching projects (plural):', innerError);
      }
    }
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const getBlogPosts = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'blogPost',
      order: '-fields.publishDate',
      include: 3,
    });
    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      description: item.fields.description,
      content: item.fields.content,
      link: item.fields.link,
      image: item.fields.image?.fields?.file?.url || '',
      publishDate: item.fields.publishDate,
      featured: item.fields.featured || false,
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
};

export const getFeaturedPost = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'blogPost',
      'fields.featured': true,
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return {
        id: item.sys.id,
        title: item.fields.title,
        description: item.fields.description,
        content: item.fields.content,
        link: item.fields.link,
        image: item.fields.image?.fields?.file?.url || '',
        publishDate: item.fields.publishDate,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return null;
  }
};

export const getProfile = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'profile',
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return {
        id: item.sys.id,
        name: item.fields.name,
        title: item.fields.title,
        location: item.fields.location,
        bio: item.fields.bio,
        profileImage: item.fields.profileImage?.fields?.file?.url || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const getSettings = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'settings',
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return {
        id: item.sys.id,
        blogArchiveUrl: item.fields.blogArchiveUrl,
        socialLinks: item.fields.socialLinks || {},
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
};

export const getSocialLinks = async () => {
  try {
    const settings = await getSettings();
    if (settings && settings.socialLinks) {
      // Convert settings JSON object to array format
      const linksArray = Object.entries(settings.socialLinks).map(
        ([key, link], index) => ({
          id: key,
          name: link.label || key,
          url: link.url || link.href,
          icon: link.icon || 'FaExternalLinkAlt',
          order: link.order || index,
          active: link.active !== false,
          disabled: !!link.disabled,
        })
      );

      return linksArray.sort((a, b) => a.order - b.order);
    }
  } catch (error) {
    console.error('Error fetching social links from settings:', error);
  }

  return [];
};

export const getYouTubeVideo = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'youtubeVideo',
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return {
        id: item.sys.id,
        title: item.fields.title,
        description: item.fields.description,
        url: item.fields.url,
        thumbnail: item.fields.thumbnail?.fields?.file?.url || '',
        duration: item.fields.duration,
        publishDate: item.fields.publishDate,
        active: item.fields.active !== false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    return null;
  }
};

export const getSoundCloudTrack = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'soundCloudTrack',
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return {
        id: item.sys.id,
        title: item.fields.title,
        description: item.fields.description,
        url: item.fields.url,
        publishDate: item.fields.publishDate,
        active: item.fields.active !== false,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching SoundCloud track:', error);
    return null;
  }
};

export const getServices = async () => {
  const tryFetch = async (contentType, useOrder = true) => {
    const params = { content_type: contentType, include: 3 };
    if (useOrder) params.order = 'fields.order';
    const response = await client.getEntries(params);
    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      subtitle: item.fields.subtitle || '',
      description: item.fields.description,
      icon: item.fields.icon || null,
      order: item.fields.order || 0,
      active: item.fields.active !== false,
    }));
  };

  try {
    return await tryFetch('service');
  } catch (error) {
    console.warn('Error fetching services (singular):', error.message);
    // If singular fails due to unknown type, try plural
    if (error.message?.includes('unknownContentType')) {
      try {
        return await tryFetch('services');
      } catch (pluralError) {
        console.error('Error fetching services (plural):', pluralError.message);
      }
    }
    // If ordering failed, try singular without order
    try {
      return await tryFetch('service', false);
    } catch (innerError) {
      // If that failed, try plural without order
      try {
        return await tryFetch('services', false);
      } catch (lastError) {
        console.error('All fetch attempts for services failed');
        return [];
      }
    }
  }
};

export const getSkills = async () => {
  const tryFetch = async (contentType, useOrder = true) => {
    const params = { content_type: contentType, include: 3 };
    if (useOrder) params.order = 'fields.order';
    const response = await client.getEntries(params);
    return response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      subtitle: item.fields.subtitle || '',
      description: item.fields.description,
      icon: item.fields.icon || null,
      order: item.fields.order || 0,
      active: item.fields.active !== false,
    }));
  };

  // Try the specific ID from Contentful first, then fall back to 'skill'/'skills'
  const idsToTry = ['6iJCkjpxHxeOEeic4bVobd', 'skill', 'skills'];

  for (const id of idsToTry) {
    try {
      return await tryFetch(id);
    } catch (error) {
      if (error.message?.includes('unknownContentType')) {
        continue;
      }
      // If it's an ordering error, try without order
      try {
        return await tryFetch(id, false);
      } catch (innerError) {
        continue;
      }
    }
  }

  console.error('All fetch attempts for skills failed');
  throw new Error('Skills content type not found in Contentful');
};

export const getBio = async () => {
  try {
    const response = await client.getEntries({
      content_type: 'profile',
      limit: 1,
      include: 3,
    });
    if (response.items.length > 0) {
      const item = response.items[0];
      return item.fields.bio || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching bio:', error);
    return null;
  }
};

// Instagram posts are fetched directly from the API via getLatestInstagramPost.
// No Contentful content type needed.
