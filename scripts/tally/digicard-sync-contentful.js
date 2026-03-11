#!/usr/bin/env node
/**
 * Contentful Sync Script
 * Pushes fallback data from React components to Contentful CMS
 *
 * Usage: node scripts/sync-contentful.js
 *
 * Required env vars in .env:
 *   - VITE_CONTENTFUL_SPACE_ID
 *   - CONTENTFUL_MANAGEMENT_KEY  (Content Management API token)
 */

import { createClient } from 'contentful-management';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load from user's OpenClaw env (has the management key)
config({ path: join(process.env.HOME, '.openclaw/.env') });

// Also load project .env for space ID
config({ path: join(__dirname, '../Projects/digicard/.env') });

const SPACE_ID = process.env.VITE_CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN =
  process.env.CONTENTFUL_MANAGEMENT_KEY || process.env.CONTENTFUL_ACCESS_TOKEN;

if (!SPACE_ID || !MANAGEMENT_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!SPACE_ID) console.error('  - VITE_CONTENTFUL_SPACE_ID');
  if (!MANAGEMENT_TOKEN) console.error('  - CONTENTFUL_MANAGEMENT_KEY');
  console.error(
    '\nGet your Management API token from: https://app.contentful.com/spaces/{SPACE_ID}/api/cma_tokens'
  );
  process.exit(1);
}

const client = createClient({ accessToken: MANAGEMENT_TOKEN });

// Fallback data extracted from components
const fallbackData = {
  projects: [
    {
      title: 'Rubber Duck Tarot',
      description:
        "Decision-making tool disguised as tarot cards, featuring a dead developer's ghost trapped in a rubber duck who helps creative people debug their mental blocks",
      link: 'https://rubberducktarot.com',
      alt: 'Rubber Duck Tarot',
      order: 1,
      active: true,
    },
  ],
  services: [
    {
      title: 'The Sovereign Protocol',
      subtitle: 'OpenClaw & Agentic Environments',
      description:
        'Building robust, personal agentic architectures. I specialize in OpenClaw orchestration, Taskwarrior integration, and long-term memory gardening to turn LLMs into true autonomous familiars.',
      icon: 'FaUserShield',
      order: 1,
      active: true,
    },
    {
      title: 'Dev-Partner Coaching',
      subtitle: 'The Buffalo Bridle Approach',
      description:
        'Tutoring for non-coders and founders. Learn how to partner with LLMs to ship high-quality products without getting lost in the syntax. We focus on strategic leverage and mental models.',
      icon: 'FaUserTie',
      order: 2,
      active: true,
    },
    {
      title: 'Agentic Product Rescue',
      subtitle: 'Modernizing Legacy Monoliths',
      description:
        'Unblocking stale projects and legacy codebases using enterprise experience coupled with modern agentic workflows to accelerate delivery and ensure system continuity.',
      icon: 'FaLifeRing',
      order: 3,
      active: true,
    },
  ],
  skills: [
    {
      title: 'Agentic Workflows',
      subtitle: 'OpenClaw, MCP, Orchestration',
      description:
        'Designing and implementing complex agentic systems that leverage Multi-Agent Orchestration and Model Context Protocol to automate high-level cognitive tasks.',
      icon: 'FaRobot',
      order: 1,
      active: true,
    },
    {
      title: 'Prompt Engineering',
      subtitle: 'Strategic Leverage & Meta-Cognition',
      description:
        'Crafting high-precision prompts and system instructions that guide LLMs through complex reasoning chains, ensuring reliable and deterministic outputs for production systems.',
      icon: 'FaBrain',
      order: 2,
      active: true,
    },
    {
      title: 'Full-Stack Development',
      subtitle: 'React, Node.js, Python',
      description:
        'Building modern, scalable web applications with a focus on performance, accessibility, and clean architecture. Expert in bridging the gap between AI and traditional software.',
      icon: 'FaCode',
      order: 3,
      active: true,
    },
  ],
};

async function getSpace() {
  console.log('🔌 Connecting to Contentful...');
  const space = await client.getSpace(SPACE_ID);
  console.log(`✅ Connected to space: ${space.name}`);
  return space;
}

async function getEnvironment(space) {
  const env = await space.getEnvironment('master');
  console.log('✅ Using master environment');
  return env;
}

async function findOrCreateEntry(environment, contentType, fields) {
  try {
    // Check if entry already exists by title
    const query = {
      content_type: contentType,
      'fields.title': fields.title['en-US'],
      limit: 1,
    };

    const entries = await environment.getEntries(query);

    if (entries.items.length > 0) {
      console.log(`  📝 Updating: ${fields.title['en-US']}`);
      const entry = entries.items[0];
      Object.keys(fields).forEach(key => {
        entry.fields[key] = fields[key];
      });
      const updated = await entry.update();
      await updated.publish();
      return updated;
    } else {
      console.log(`  ➕ Creating: ${fields.title['en-US']}`);
      const entry = await environment.createEntry(contentType, { fields });
      await entry.publish();
      return entry;
    }
  } catch (error) {
    console.error(`  ❌ Error with "${fields.title['en-US']}":`, error.message);
    throw error;
  }
}

async function syncProjects(env) {
  console.log('\n📁 Syncing Projects...');
  for (const p of fallbackData.projects) {
    await findOrCreateEntry(env, 'project', {
      title: { 'en-US': p.title },
      description: { 'en-US': p.description },
      link: { 'en-US': p.link },
      alt: { 'en-US': p.alt },
      order: { 'en-US': p.order },
      active: { 'en-US': p.active },
    });
  }
}

async function syncServices(env) {
  console.log('\n📁 Syncing Services...');
  for (const s of fallbackData.services) {
    await findOrCreateEntry(env, 'service', {
      title: { 'en-US': s.title },
      subtitle: { 'en-US': s.subtitle },
      description: { 'en-US': s.description },
      icon: { 'en-US': s.icon },
      order: { 'en-US': s.order },
      active: { 'en-US': s.active },
    });
  }
}

async function syncSkills(env) {
  console.log('\n📁 Syncing Skills...');
  for (const s of fallbackData.skills) {
    await findOrCreateEntry(env, 'skill', {
      title: { 'en-US': s.title },
      subtitle: { 'en-US': s.subtitle },
      description: { 'en-US': s.description },
      icon: { 'en-US': s.icon },
      order: { 'en-US': s.order },
      active: { 'en-US': s.active },
    });
  }
}

async function checkContentTypes(env) {
  console.log('\n🔍 Checking content types...');
  const required = ['project', 'service', 'skill'];
  const missing = [];

  for (const typeId of required) {
    try {
      await env.getContentType(typeId);
      console.log(`  ✅ ${typeId}`);
    } catch {
      console.error(`  ❌ ${typeId} - MISSING`);
      missing.push(typeId);
    }
  }

  if (missing.length) {
    console.error(
      '\n⚠️  Create these content types in Contentful web app first!'
    );
    return false;
  }
  return true;
}

async function main() {
  console.log('🚀 Contentful Sync Starting...\n');

  try {
    const space = await getSpace();
    const env = await getEnvironment(space);

    if (!(await checkContentTypes(env))) process.exit(1);

    await syncProjects(env);
    await syncServices(env);
    await syncSkills(env);

    console.log('\n✅ Sync complete!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    if (error.message.includes('401')) {
      console.error(
        '\n💡 Your CONTENTFUL_MANAGEMENT_KEY may be invalid or expired.'
      );
      console.error(
        '   Generate a new one at: Settings > API keys > Content management tokens'
      );
    }
    process.exit(1);
  }
}

main();
