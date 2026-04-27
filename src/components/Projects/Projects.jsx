import clsx from 'clsx';
import rubberDuckTarotIMG from '../../assets/RDTBanner.png';
import { useContentful } from '../../hooks/useContentful';
import { getProjects } from '../../utils/contentful';
import DynamicIcon from '../DynamicIcon';
import SectionHeading from '../SectionHeading';
import styles from './Projects.module.css';
import { createThemeClassGetter } from '../helpers/themeClassHelper';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { renderMarkdown } from '../../utils/stringUtils';

/**
 * Render a description field that may be a Contentful Rich Text document
 * or a plain string (from fallback data).
 */
const ContentDescription = ({ description, className, theme }) => {
  if (!description) return null;

  const textColorClass =
    'text-black/90 dark:text-white/90 matrix:text-matrix-text catppuccin:text-catppuccin-text flexoki:text-flexoki-text';

  if (typeof description === 'object' && description.nodeType) {
    return (
      <div
        className={clsx(
          'text-sm leading-relaxed max-w-none space-y-3',
          textColorClass,
          className
        )}
      >
        {documentToReactComponents(description)}
      </div>
    );
  }

  // Handle plain string (Markdown fallback)
  return (
    <div
      className={clsx(
        'text-sm leading-relaxed max-w-none space-y-3',
        textColorClass,
        className
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(description, theme) }}
    />
  );
};

// Theme class resolver for this component
const getThemeClass = createThemeClassGetter(styles);

const ProjectCard = ({
  img,
  alt,
  title,
  description,
  link,
  icon,
  theme,
  index,
}) => {
  const isEven = index % 2 === 0;

  return (
    <article
      className={clsx(
        'grid gap-4 md:gap-8',
        'md:grid-cols-2 items-center py-8',
        !isEven && 'md:direction-rtl'
      )}
    >
      {/* Image frame */}
      <div
        className={clsx(
          'relative overflow-hidden aspect-[16/10]',
          isEven ? 'md:order-1' : 'md:order-2'
        )}
      >
        <img
          src={img}
          alt={alt}
          className={clsx('w-full h-full object-cover', styles.imageBase)}
        />
      </div>

      {/* Content with asymmetric spacing */}
      <div
        className={clsx(
          'flex flex-col',
          isEven
            ? 'md:order-2 md:pl-4'
            : 'md:order-1 md:pr-4 md:text-right md:items-end'
        )}
      >
        {/* Title with icon */}
        <div
          className={clsx(
            'flex items-center gap-3 mb-3',
            !isEven && 'md:flex-row-reverse'
          )}
        >
          {icon && (
            <DynamicIcon
              iconName={icon}
              className={clsx('opacity-60', getThemeClass(theme, 'icon'))}
              size={20}
            />
          )}
          <h3
            className={clsx(
              'text-xl md:text-2xl font-heading font-bold tracking-tight',
              getThemeClass(theme, 'title')
            )}
          >
            {title}
          </h3>
        </div>

        {/* Description */}
        <div className={clsx('mb-6 leading-relaxed')}>
          <ContentDescription
            description={description}
            className={clsx(styles.descBase, getThemeClass(theme, 'desc'))}
            theme={theme}
          />
        </div>

        {/* CTA as text link */}
        <a
          href={link}
          className={clsx(
            'inline-flex items-center gap-2 text-sm font-medium tracking-wide',
            !isEven && 'md:flex-row-reverse',
            getThemeClass(theme, 'link')
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>View Project</span>
          <span>→</span>
        </a>
      </div>
    </article>
  );
};

// Fallback projects for when Contentful is not available
const fallbackProjects = [
  {
    imgNormal: rubberDuckTarotIMG,
    alt: 'Rubber Duck Tarot',
    title: 'Rubber Duck Tarot',
    description:
      "Decision-making tool disguised as tarot cards, featuring a dead developer's ghost trapped in a rubber duck who helps creative people debug their mental blocks",
    link: 'https://rubberducktarot.com',
    order: 1,
    active: true,
  },
];

const Projects = ({ theme }) => {
  const { data: cmsProjects, loading, error } = useContentful(getProjects);

  // Use CMS data if available, otherwise fall back to static data
  const projects =
    cmsProjects && cmsProjects.length > 0 ? cmsProjects : fallbackProjects;

  if (loading) {
    return (
      <section
        className={clsx(
          'p-5',
          styles.sectionBase,
          getThemeClass(theme, 'section')
        )}
      >
        <SectionHeading>Projects</SectionHeading>
        <div className="text-center py-8">Loading projects...</div>
      </section>
    );
  }

  if (error) {
    console.warn('Contentful error, using fallback data:', error);
  }

  if (theme === 'web2') {
    return <ClassicProjectsList theme={theme} projects={projects} />;
  }

  // sort projects by order
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  // Cinematic asymmetric layout for other themes
  return (
    <section
      className={clsx(
        'px-4 md:px-8 py-8',
        styles.sectionBase,
        getThemeClass(theme, 'section')
      )}
    >
      <div className="max-w-4xl mx-auto space-y-0">
        {sortedProjects
          .filter(projectItem => projectItem.active)
          .map((projectItem, index) => {
            const imageSrc = projectItem.imgWide
              ? projectItem.imgWide
              : projectItem.imgNormal;
            return (
              <ProjectCard
                key={projectItem.title}
                img={imageSrc}
                alt={projectItem.alt}
                title={projectItem.title}
                description={projectItem.description}
                link={projectItem.link}
                icon={projectItem.icon}
                theme={theme}
                index={index}
              />
            );
          })}
      </div>
    </section>
  );
};

const ClassicProjectsList = ({ theme, projects }) => (
  <section
    className={clsx(
      'p-6',
      styles.classicSectionBase,
      getThemeClass(theme, 'classicSection')
    )}
  >
    <div className={clsx('flex flex-col gap-8')}>
      {projects.map(project => (
        <div
          key={project.title}
          className={clsx(
            'flex flex-row items-start gap-6 pb-6 mb-4',
            styles.classicItemBase,
            getThemeClass(theme, 'classicItem'),
            'last:border-b-0 last:mb-0 last:pb-0'
          )}
        >
          <img
            src={project.imgNormal}
            alt={project.alt}
            className={clsx(
              'w-32 h-32 object-cover mt-2 mb-2 ml-2',
              styles.classicImageBase,
              getThemeClass(theme, 'classicImage')
            )}
            style={{ float: 'left' }}
          />
          <div className="flex-1">
            <h3 className={clsx('text-xl mb-1')}>
              <a
                href={project.link}
                className={clsx(getThemeClass(theme, 'classicLink'))}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.title}
              </a>
            </h3>
            <ContentDescription
              description={project.description}
              className={clsx('mb-2', getThemeClass(theme, 'classicDesc'))}
              theme={theme}
            />
            {/* Optionally add meta info here */}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Projects;
