#!/usr/bin/env node
/* eslint-env node */

/**
 * Contentful Sync Script
 * Fetches services, projects, and other data from Contentful and writes fallback JSON files
 * Usage: node scripts/sync-contentful.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from 'contentful';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const devDataDir = path.join(projectRoot, 'src', 'dev-data');

// Ensure dev-data directory exists
if (!fs.existsSync(devDataDir)) {
  fs.mkdirSync(devDataDir, { recursive: true });
}

// Initialize Contentful client
const client = createClient({
  // eslint-disable-next-line no-undef
  space: process.env.VITE_CONTENTFUL_SPACE_ID,
  // eslint-disable-next-line no-undef
  accessToken: process.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

const log = msg => console.log(`[Sync] ${msg}`);
const error = msg => console.error(`[Error] ${msg}`);

/**
 * Fetch services from Contentful
 */
async function fetchServices() {
  try {
    log('Fetching services...');
    const response = await client.getEntries({
      content_type: 'service',
      order: 'fields.order',
    });

    const services = response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      subtitle: item.fields.subtitle || '',
      description: item.fields.description,
      icon: item.fields.icon || null,
      order: item.fields.order || 0,
      active: item.fields.active !== false,
    }));

    return services;
  } catch (err) {
    if (
      err.message?.includes('400') ||
      err.statusText?.includes('Bad Request')
    ) {
      log(
        '⚠ Services content model not found or "order" field is missing (ID: "service")'
      );
      // Retry without order
      try {
        log('Retrying services fetch without sorting...');
        const response = await client.getEntries({
          content_type: 'service',
        });
        return response.items.map(item => ({
          id: item.sys.id,
          title: item.fields.title,
          subtitle: item.fields.subtitle || '',
          description: item.fields.description,
          icon: item.fields.icon || null,
          order: item.fields.order || 0,
          active: item.fields.active !== false,
        }));
      } catch (retryErr) {
        log(`⚠ Retry failed: ${retryErr.message}`);
      }
    } else {
      error(`Failed to fetch services: ${err.message}`);
    }
    return [];
  }
}

/**
 * Fetch projects from Contentful
 */
async function fetchProjects() {
  try {
    log('Fetching projects...');
    const response = await client.getEntries({
      content_type: 'project',
      order: 'fields.order',
    });

    const projects = response.items.map(item => ({
      id: item.sys.id,
      title: item.fields.title,
      description: item.fields.description,
      link: item.fields.link,
      imgNormal: item.fields.image?.fields?.file?.url || '',
      imgWide: item.fields.imageWide?.fields?.file?.url || '',
      alt: item.fields.alt || item.fields.title,
      order: item.fields.order || 0,
      active: item.fields.active !== false,
      icon: item.fields.icon || null,
    }));

    return projects;
  } catch (err) {
    error(`Failed to fetch projects: ${err.message}`);
    return [];
  }
}

/**
 * Fetch skills from Contentful (optional, may not exist)
 */
async function fetchSkills() {
  const idsToTry = ['6iJCkjpxHxeOEeic4bVobd', 'skill', 'skills'];

  for (const id of idsToTry) {
    try {
      log(`Fetching skills (ID: "${id}")...`);
      const response = await client.getEntries({
        content_type: id,
        order: 'fields.order',
      });

      const skills = response.items.map(item => ({
        id: item.sys.id,
        title: item.fields.title,
        subtitle: item.fields.subtitle || '',
        description: item.fields.description,
        icon: item.fields.icon || null,
        order: item.fields.order || 0,
        active: item.fields.active !== false,
      }));

      return skills;
    } catch (err) {
      if (
        err.message?.includes('400') ||
        err.statusText?.includes('Bad Request')
      ) {
        log(`⚠ Skills ID "${id}" not found, trying next...`);
        // If it was the last one, retry without order
        if (id === idsToTry[idsToTry.length - 1]) {
          try {
            log('Retrying skills fetch without sorting...');
            const response = await client.getEntries({
              content_type: id,
            });
            return response.items.map(item => ({
              id: item.sys.id,
              title: item.fields.title,
              subtitle: item.fields.subtitle || '',
              description: item.fields.description,
              icon: item.fields.icon || null,
              order: item.fields.order || 0,
              active: item.fields.active !== false,
            }));
          } catch (retryErr) {
            log(`⚠ Retry failed: ${retryErr.message}`);
          }
        }
        continue;
      } else {
        error(`Failed to fetch skills: ${err.message}`);
        return [];
      }
    }
  }
  return [];
}

/**
 * Write data to JSON file
 */
function writeJson(filename, data) {
  const filepath = path.join(devDataDir, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    log(`✓ Wrote ${data.length} items to ${filename}`);
    return true;
  } catch (err) {
    error(`Failed to write ${filename}: ${err.message}`);
    return false;
  }
}

/**
 * Main sync function
 */
async function sync() {
  log('Starting Contentful sync...');
  log(`Writing to: ${devDataDir}`);

  try {
    const [services, projects, skills] = await Promise.all([
      fetchServices(),
      fetchProjects(),
      fetchSkills(),
    ]);

    writeJson('services.json', services);
    writeJson('projects.json', projects);
    if (skills.length > 0) {
      writeJson('skills.json', skills);
    }

    log('Sync complete!');
  } catch (err) {
    error(`Sync failed: ${err.message}`);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
}

// Run sync
sync();
