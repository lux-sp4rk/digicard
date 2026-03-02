import React from 'react';
import ContentList from './ContentList';
import { getServices } from '../utils/contentful';

// Fallback data for when Contentful is unavailable
const fallbackServices = [
  {
    id: '1',
    title: 'The Sovereign Protocol',
    subtitle: 'OpenClaw & Agentic Environments',
    description:
      'Building robust, personal agentic architectures. I specialize in OpenClaw orchestration, Taskwarrior integration, and long-term memory gardening to turn LLMs into true autonomous familiars.',
    icon: 'FaUserShield',
    order: 1,
    active: true,
  },
  {
    id: '2',
    title: 'Dev-Partner Coaching',
    subtitle: 'The Buffalo Bridle Approach',
    description:
      'Tutoring for non-coders and founders. Learn how to partner with LLMs to ship high-quality products without getting lost in the syntax. We focus on strategic leverage and mental models.',
    icon: 'FaUserTie',
    order: 2,
    active: true,
  },
  {
    id: '3',
    title: 'Agentic Product Rescue',
    subtitle: 'Modernizing Legacy Monoliths',
    description:
      'Unblocking stale projects and legacy codebases using enterprise experience coupled with modern agentic workflows to accelerate delivery and ensure system continuity.',
    icon: 'FaLifeRing',
    order: 3,
    active: true,
  },
];

const Services = ({ theme = 'catppuccin' }) => {
  return (
    <ContentList
      fetchFn={getServices}
      fallbackData={fallbackServices}
      sectionTitle="Services"
      ctaHeading="Ready to architect your continuity?"
      ctaButtonText="Book a Consultation"
      ctaHref="https://tally.so/r/ODAodA"
      theme={theme}
    />
  );
};

export default Services;
