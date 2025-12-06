import clsx from 'clsx';
import sbBukowskisImg from '../../assets/sb-bukowskis.jpg';
import rubberDuckTarotIMG from '../../assets/RDTBanner.png';
import { useContentful } from '../../hooks/useContentful';
import { getProjects } from '../../utils/contentful';
import DynamicIcon from '../DynamicIcon';
import SectionHeading from '../SectionHeading';
import styles from './Projects.module.css';
import { createThemeClassGetter } from '../helpers/themeClassHelper';

// Theme class resolver for this component
const getThemeClass = createThemeClassGetter(styles);

const ProjectCard = ({
  img,
  alt,
  title,
  description,
  link,
  icon,
  createRipple,
  theme,
}) => (
  <div
    className={clsx(
      'flex flex-col min-h-[22rem]', // layout only
      styles.cardBase,
      getThemeClass(theme, 'card')
    )}
  >
    <div className="h-40 overflow-hidden">
      <img
        src={img}
        alt={alt}
        className={clsx(
          'w-full h-full', // layout only
          styles.imageBase,
          img === sbBukowskisImg && styles.imgObjectCoverCenter,
          img === rubberDuckTarotIMG && styles.imgObjectCoverCenter
        )}
      />
    </div>
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      {icon && (
        <DynamicIcon
          iconName={icon}
          className={getThemeClass(theme, 'icon')}
          size={20}
        />
      )}
      <h3 className={clsx(styles.titleBase, getThemeClass(theme, 'title'))}>
        {title}
      </h3>
    </div>
    <p
      className={clsx(
        'px-4 pb-4',
        styles.descBase,
        getThemeClass(theme, 'desc')
      )}
    >
      {description}
    </p>
    <div className="flex-1" />
    <a
      href={link}
      className={clsx(
        'block text-center py-2 relative overflow-hidden', // layout only
        styles.linkBase,
        getThemeClass(theme, 'link')
      )}
      onClick={createRipple}
      target="_blank"
      rel="noopener noreferrer"
    >
      View Project
    </a>
  </div>
);

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

  // Create ripple effect on project links
  const createRipple = event => {
    const button = event.currentTarget;

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  };

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

  if (theme === 'web2' || theme === 'csszen') {
    return <ClassicProjectsList theme={theme} projects={projects} />;
  }

  // sort projects by order
  const sortedProjects = [...projects].sort((a, b) => a.order - b.order);

  const isOddLayout = sortedProjects.length % 2 !== 0;

  // Modern card layout for other themes
  return (
    <section
      className={clsx(
        'p-5',
        styles.sectionBase,
        getThemeClass(theme, 'section')
      )}
    >
      <div
        className={clsx(
          'grid gap-6',
          isOddLayout ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
        )}
      >
        {sortedProjects
          .filter(projectItem => projectItem.active)
          .map(projectItem => {
            const imageSrc =
              isOddLayout && projectItem.imgWide
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
                createRipple={createRipple}
                theme={theme}
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
            <p className={clsx('mb-2', getThemeClass(theme, 'classicDesc'))}>
              {project.description}
            </p>
            {/* Optionally add meta info here */}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Projects;
