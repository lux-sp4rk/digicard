#!/usr/bin/env node
/**
 * Build-time Contentful fetcher.
 * Fetches all CMS data, converts rich text to HTML, and writes static JSON.
 * Run via: `node --loader ts-node/esm scripts/fetch-content.ts`
 * Or add to package.json: "prebuild": "tsx scripts/fetch-content.ts"
 */

import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const OUT_DIR = resolve(process.cwd(), 'src', 'data', 'generated');
mkdirSync(OUT_DIR, { recursive: true });

const SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.VITE_CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !ACCESS_TOKEN) {
  console.warn(
    '[fetch-content] Contentful credentials missing. Writing empty stub so dev-data fallback kicks in.'
  );
  writeFileSync(
    resolve(OUT_DIR, 'contentful.json'),
    JSON.stringify(
      {
        projects: [],
        services: [],
        skills: [],
        profile: null,
        settings: null,
        youTubeVideo: null,
        soundCloudTrack: null,
      },
      null,
      2
    )
  );
  process.exit(0);
}

const client = createClient({ space: SPACE_ID, accessToken: ACCESS_TOKEN });

const richTextOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const asset = node?.data?.target;
      if (!asset?.fields?.file) return '';
      const { file } = asset.fields;
      if (!file.contentType?.startsWith('image/')) return '';
      const url = file.url?.startsWith('//') ? `https:${file.url}` : file.url;
      const alt =
        asset.fields.description || asset.fields.title || file.fileName || '';
      return `<img src="${url}" alt="${alt}" loading="lazy" class="max-w-full h-auto rounded-lg my-4" />`;
    },
    [BLOCKS.PARAGRAPH]: (node: any, next: any) => {
      const children = node.content || [];
      return `<p class="mb-3">${next(children)}</p>`;
    },
    [BLOCKS.HEADING_1]: (node: any, next: any) => {
      const children = node.content || [];
      return `<h1 class="text-2xl font-bold mb-4">${next(children)}</h1>`;
    },
    [BLOCKS.HEADING_2]: (node: any, next: any) => {
      const children = node.content || [];
      return `<h2 class="text-xl font-bold mb-3">${next(children)}</h2>`;
    },
    [BLOCKS.HEADING_3]: (node: any, next: any) => {
      const children = node.content || [];
      return `<h3 class="text-lg font-bold mb-2">${next(children)}</h3>`;
    },
    [BLOCKS.UL_LIST]: (node: any, next: any) => {
      const children = node.content || [];
      return `<ul class="list-disc pl-5 mb-3 space-y-1">${next(children)}</ul>`;
    },
    [BLOCKS.OL_LIST]: (node: any, next: any) => {
      const children = node.content || [];
      return `<ol class="list-decimal pl-5 mb-3 space-y-1">${next(children)}</ol>`;
    },
    [BLOCKS.LIST_ITEM]: (node: any, next: any) => {
      const children = node.content || [];
      return `<li>${next(children)}</li>`;
    },
    [BLOCKS.QUOTE]: (node: any, next: any) => {
      const children = node.content || [];
      return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${next(children)}</blockquote>`;
    },
    [INLINES.HYPERLINK]: (node: any, next: any) => {
      const children = node.content || [];
      const url = node.data.uri || '#';
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80">${next(children)}</a>`;
    },
  },
};

function normalizeUrl(url: string): string {
  if (!url) return '';
  if (url.match(/^https?:\/\//) || url.startsWith('//')) return url;
  return `https://${url}`;
}

function renderRichText(doc: any): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (!doc.nodeType) return '';
  return documentToHtmlString(doc, richTextOptions);
}

async function fetchProjects() {
  const response = await client.getEntries({
    content_type: 'project',
    order: 'fields.order',
    include: 3,
  });
  return response.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    description: renderRichText(item.fields.description),
    descriptionRaw: item.fields.description,
    link: normalizeUrl(item.fields.link),
    imgNormal: item.fields.image?.fields?.file?.url || '',
    imgWide: item.fields.imageWide?.fields?.file?.url || '',
    alt: item.fields.alt || item.fields.title,
    order: item.fields.order || 0,
    active: item.fields.active !== false,
    icon: item.fields.icon || null,
  }));
}

async function fetchServices() {
  const response = await client.getEntries({
    content_type: 'service',
    order: 'fields.order',
    include: 3,
  });
  return response.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    subtitle: item.fields.subtitle || '',
    description: renderRichText(item.fields.description),
    descriptionRaw: item.fields.description,
    icon: item.fields.icon || null,
    order: item.fields.order || 0,
    active: item.fields.active !== false,
  }));
}

async function fetchSkills() {
  const response = await client.getEntries({
    content_type: 'skill',
    order: 'fields.order',
    include: 3,
  });
  return response.items.map((item: any) => ({
    id: item.sys.id,
    title: item.fields.title,
    subtitle: item.fields.subtitle || '',
    description: renderRichText(item.fields.description),
    descriptionRaw: item.fields.description,
    icon: item.fields.icon || null,
    order: item.fields.order || 0,
    active: item.fields.active !== false,
  }));
}

async function fetchProfile() {
  const response = await client.getEntries({
    content_type: 'profile',
    limit: 1,
    include: 3,
  });
  if (response.items.length === 0) return null;
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

async function fetchSettings() {
  const response = await client.getEntries({
    content_type: 'settings',
    limit: 1,
    include: 3,
  });
  if (response.items.length === 0) return null;
  const item = response.items[0];
  const links = item.fields.socialLinks || {};
  const socialLinks = Object.entries(links)
    .map(([key, link]: [string, any], index: number) => ({
      id: key,
      name: link.label || key,
      url: link.url || link.href,
      icon: link.icon || 'FaExternalLinkAlt',
      order: link.order || index,
      active: link.active !== false,
      disabled: !!link.disabled,
    }))
    .sort((a: any, b: any) => a.order - b.order);

  return {
    id: item.sys.id,
    blogArchiveUrl: item.fields.blogArchiveUrl,
    socialLinks,
  };
}

async function fetchYouTubeVideo() {
  const response = await client.getEntries({
    content_type: 'youtubeVideo',
    limit: 1,
    include: 3,
  });
  if (response.items.length === 0) return null;
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

async function fetchSoundCloudTrack() {
  const response = await client.getEntries({
    content_type: 'soundCloudTrack',
    limit: 1,
    include: 3,
  });
  if (response.items.length === 0) return null;
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

async function main() {
  console.log('[fetch-content] Building static data from Contentful...');

  const data: Record<string, any> = {};

  try {
    data.projects = await fetchProjects();
  } catch (e) {
    console.warn('Projects fetch failed:', e);
    data.projects = [];
  }
  try {
    data.services = await fetchServices();
  } catch (e) {
    console.warn('Services fetch failed:', e);
    data.services = [];
  }
  try {
    data.skills = await fetchSkills();
  } catch (e) {
    console.warn('Skills fetch failed:', e);
    data.skills = [];
  }
  try {
    data.profile = await fetchProfile();
  } catch (e) {
    console.warn('Profile fetch failed:', e);
    data.profile = null;
  }
  try {
    data.settings = await fetchSettings();
  } catch (e) {
    console.warn('Settings fetch failed:', e);
    data.settings = null;
  }
  try {
    data.youTubeVideo = await fetchYouTubeVideo();
  } catch (e) {
    console.warn('YouTube fetch failed:', e);
    data.youTubeVideo = null;
  }
  try {
    data.soundCloudTrack = await fetchSoundCloudTrack();
  } catch (e) {
    console.warn('SoundCloud fetch failed:', e);
    data.soundCloudTrack = null;
  }

  writeFileSync(
    resolve(OUT_DIR, 'contentful.json'),
    JSON.stringify(data, null, 2)
  );
  console.log('[fetch-content] Wrote src/data/generated/contentful.json');
}

main().catch(console.error);
