import clsx from 'clsx';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import SectionHeading from './SectionHeading';
import DynamicIcon from './DynamicIcon';
import { useContentful } from '../hooks/useContentful';
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

/**
 * Render a description field that may be a Contentful Rich Text document
 * or a plain string (from fallback data).
 */
const ServiceDescription = ({ description, className }) => {
  if (!description) return null;

  // Rich Text document from Contentful has a nodeType property
  if (typeof description === 'object' && description.nodeType) {
    return (
      <div
        className={clsx(
          'text-base leading-relaxed opacity-90 prose prose-sm max-w-none',
          className
        )}
      >
        {documentToReactComponents(description)}
      </div>
    );
  }

  // Plain string (fallback data)
  return (
    <p className={clsx('text-base leading-relaxed opacity-90', className)}>
      {description}
    </p>
  );
};

const Services = ({ theme = 'catppuccin' }) => {
  const { data: cmsServices, loading, error } = useContentful(getServices);

  const services =
    cmsServices && cmsServices.length > 0 ? cmsServices : fallbackServices;

  const sortedServices = [...services]
    .filter(s => s.active)
    .sort((a, b) => a.order - b.order);

  if (error) {
    console.warn('Contentful error, using fallback services data:', error);
  }

  return (
    <section className={clsx('p-5 animate-fade-in')}>
      <SectionHeading>Services</SectionHeading>

      {loading && (
        <div className="text-center py-8 opacity-60">Loading services...</div>
      )}

      {!loading && (
        <div className="grid gap-6 grid-cols-1">
          {sortedServices.map(service => (
            <div
              key={service.id || service.title}
              className={clsx(
                'p-6 rounded-lg border transition-all duration-300',
                'hover:scale-[1.01]',
                theme === 'catppuccin' &&
                  'bg-catppuccin-surface border-catppuccin-surface text-catppuccin-text',
                theme === 'flexoki' &&
                  'bg-flexoki-surface border-flexoki-surface text-flexoki-text',
                theme === 'matrix' &&
                  'bg-matrix-terminal border-matrix-glow text-matrix-glow shadow-[0_0_10px_rgba(0,255,0,0.1)]',
                theme === 'web2' &&
                  'bg-web2-background border-web2-border shadow-sm',
                // Fallback for deprecated or unknown themes
                (theme === 'dark' ||
                  theme === 'light' ||
                  theme === 'rosepine') &&
                  'bg-catppuccin-surface border-catppuccin-surface text-catppuccin-text'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {service.icon && (
                  <DynamicIcon
                    iconName={service.icon}
                    size={24}
                    className={clsx(
                      theme === 'catppuccin' && 'text-catppuccin-blue',
                      theme === 'flexoki' && 'text-flexoki-cyan',
                      theme === 'matrix' && 'text-matrix-glow',
                      theme === 'web2' && 'text-web2-primary',
                      (theme === 'dark' ||
                        theme === 'light' ||
                        theme === 'rosepine') &&
                        'text-catppuccin-blue'
                    )}
                  />
                )}
                <div>
                  <h3 className="text-xl font-bold leading-tight">
                    {service.title}
                  </h3>
                  {service.subtitle && (
                    <p
                      className={clsx(
                        'text-sm font-medium opacity-80',
                        theme === 'matrix' && 'text-matrix-rain'
                      )}
                    >
                      {service.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <ServiceDescription description={service.description} />
            </div>
          ))}
        </div>
      )}

      {/* CTA — intentionally hardcoded */}
      <div
        className={clsx(
          'mt-8 p-6 rounded-xl text-center border-2 border-dashed',
          theme === 'catppuccin' &&
            'border-catppuccin-blue/30 text-catppuccin-text',
          theme === 'flexoki' && 'border-flexoki-cyan/30 text-flexoki-text',
          theme === 'matrix' && 'border-matrix-glow/30 text-matrix-glow',
          theme === 'web2' && 'border-web2-primary/30 text-web2-text',
          (theme === 'dark' || theme === 'light' || theme === 'rosepine') &&
            'border-catppuccin-blue/30 text-catppuccin-text'
        )}
      >
        <p className="text-lg font-bold mb-2">
          Ready to architect your continuity?
        </p>
        <a
          href="mailto:ulises@luxspark.com"
          className={clsx(
            'inline-block px-6 py-2 rounded-full font-bold transition-transform hover:scale-105',
            theme === 'catppuccin' && 'bg-catppuccin-blue text-catppuccin-base',
            theme === 'flexoki' && 'bg-flexoki-cyan text-flexoki-base',
            theme === 'matrix' &&
              'bg-matrix-glow text-matrix-terminal shadow-[0_0_15px_#0f0]',
            theme === 'web2' && 'bg-web2-primary text-white',
            (theme === 'dark' || theme === 'light' || theme === 'rosepine') &&
              'bg-catppuccin-blue text-catppuccin-base'
          )}
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
};

export default Services;
