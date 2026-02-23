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
 * Theme-specific Tailwind class bundles for service card elements.
 * Extracts repeated theme logic from inline JSX expressions.
 */
const LEGACY_THEMES = ['dark', 'light', 'rosepine'];

export const getServiceCardClasses = theme => {
  if (theme === 'flexoki')
    return 'bg-flexoki-surface border-flexoki-surface text-flexoki-text';
  if (theme === 'matrix')
    return 'bg-matrix-terminal border-matrix-glow text-matrix-glow shadow-[0_0_10px_rgba(0,255,0,0.1)]';
  if (theme === 'web2')
    return 'bg-web2-background border-web2-border shadow-sm';
  // catppuccin + legacy themes all map to catppuccin styles
  return 'bg-catppuccin-surface border-catppuccin-surface text-catppuccin-text';
};

export const getServiceIconClasses = theme => {
  if (theme === 'flexoki') return 'text-flexoki-cyan';
  if (theme === 'matrix') return 'text-matrix-glow';
  if (theme === 'web2') return 'text-web2-primary';
  return 'text-catppuccin-blue';
};

export const getServiceCtaBorderClasses = theme => {
  if (theme === 'flexoki') return 'border-flexoki-cyan/30 text-flexoki-text';
  if (theme === 'matrix') return 'border-matrix-glow/30 text-matrix-glow';
  if (theme === 'web2') return 'border-web2-primary/30 text-web2-text';
  return 'border-catppuccin-blue/30 text-catppuccin-text';
};

export const getServiceCtaButtonClasses = theme => {
  if (theme === 'flexoki') return 'bg-flexoki-cyan text-flexoki-base';
  if (theme === 'matrix')
    return 'bg-matrix-glow text-matrix-terminal shadow-[0_0_15px_#0f0]';
  if (theme === 'web2') return 'bg-web2-primary text-white';
  return 'bg-catppuccin-blue text-catppuccin-base';
};

/**
 * Render a description field that may be a Contentful Rich Text document
 * or a plain string (from fallback data).
 *
 * Fix: Removed conflicting `text-base leading-relaxed` from the rich-text
 * path — `prose prose-sm` already sets its own font-size and line-height,
 * and mixing them caused override conflicts.
 */
const ServiceDescription = ({ description, className }) => {
  if (!description) return null;

  // Rich Text document from Contentful has a nodeType property
  if (typeof description === 'object' && description.nodeType) {
    return (
      <div className={clsx('opacity-90 prose prose-sm max-w-none', className)}>
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
          {sortedServices.map((service, index) => (
            <div
              key={service.id || `service-${index}`}
              className={clsx(
                'p-6 rounded-lg border transition-all duration-300',
                'hover:scale-[1.01]',
                getServiceCardClasses(theme)
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                {service.icon && (
                  <DynamicIcon
                    iconName={service.icon}
                    size={24}
                    className={getServiceIconClasses(theme)}
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
          getServiceCtaBorderClasses(theme)
        )}
      >
        <p className="text-lg font-bold mb-2">
          Ready to architect your continuity?
        </p>
        <a
          href="mailto:ulises@luxspark.com"
          className={clsx(
            'inline-block px-6 py-2 rounded-full font-bold transition-transform hover:scale-105',
            getServiceCtaButtonClasses(theme)
          )}
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
};

export default Services;
