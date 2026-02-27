import React from 'react';
import ContentList from './ContentList';
import { getSkills } from '../utils/contentful';

// Fallback data for when Contentful is unavailable
const fallbackSkills = [
  {
    id: 's1',
    title: 'Agentic Workflows',
    subtitle: 'OpenClaw, MCP, Orchestration',
    description:
      'Designing and implementing complex agentic systems that leverage Multi-Agent Orchestration and Model Context Protocol to automate high-level cognitive tasks.',
    icon: 'FaRobot',
    order: 1,
    active: true,
  },
  {
    id: 's2',
    title: 'Prompt Engineering',
    subtitle: 'Strategic Leverage & Meta-Cognition',
    description:
      'Crafting high-precision prompts and system instructions that guide LLMs through complex reasoning chains, ensuring reliable and deterministic outputs for production systems.',
    icon: 'FaBrain',
    order: 2,
    active: true,
  },
  {
    id: 's3',
    title: 'Full-Stack Development',
    subtitle: 'React, Node.js, Python',
    description:
      'Building modern, scalable web applications with a focus on performance, accessibility, and clean architecture. Expert in bridging the gap between AI and traditional software.',
    icon: 'FaCode',
    order: 3,
    active: true,
  },
];

const Skills = ({ theme = 'catppuccin' }) => {
  return (
    <ContentList
      fetchFn={getSkills}
      fallbackData={fallbackSkills}
      sectionTitle="Skills"
      ctaHeading="Want to leverage these skills for your project?"
      ctaButtonText="Let's Talk"
      ctaHref="mailto:ulises@luxspark.com"
      theme={theme}
    />
  );
};

export default Skills;
