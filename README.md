# DigiCard

Personal digital portfolio with dynamic theming and CMS integration.

## Features

- Multiple dynamic themes (GitHub, Dracula, Matrix, Web2, CSS Zen Garden)
- Console easter eggs
- Contentful CMS integration with fallback to static data
- Project showcase with customizable cards
- Blog integration (Beehiiv)
- YouTube widget
- Responsive design

## Tech Stack

- React 18 + Vite
- Tailwind CSS (layout) + CSS Modules (theming)
- Contentful (headless CMS)
- Netlify deployment + serverless functions
- Vitest + React Testing Library
- ESLint + Prettier + Husky

## Quick Start

### Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js v25.2.1 (see `.nvmrc`)

### Installation

```bash
# Clone and setup
git clone <repo-url>
cd digicard
cp .env.example .env
# Edit .env with your API keys

# Start with Docker (recommended)
docker-compose up

# OR run locally
pnpm install
pnpm run dev
```

Access at [http://localhost:5173](http://localhost:5173)

## Environment Variables

```bash
# Contentful CMS
VITE_CONTENTFUL_SPACE_ID=
VITE_CONTENTFUL_ACCESS_TOKEN=

# Analytics (optional)
VITE_UMAMI_WEBSITE_ID=
VITE_UMAMI_SCRIPT_URL=

# Beehiiv (optional)
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=

# YouTube (optional)
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=
```

See [docs/CONTENTFUL_SETUP.md](docs/CONTENTFUL_SETUP.md) for Contentful setup.

## Development

### Docker Workflow

```bash
# Start
docker-compose up

# Rebuild
docker-compose up --build

# Stop
docker-compose down

# Logs
docker-compose logs -f app
```

### Available Scripts

```bash
pnpm run dev              # Start dev server (runs in Docker)
pnpm run build            # Build for production
pnpm run preview          # Preview production build
pnpm run lint             # Run ESLint
pnpm run format           # Format with Prettier
pnpm run format:check     # Check formatting
pnpm run test             # Run tests
pnpm run test:watch       # Tests in watch mode
pnpm run test:coverage    # Coverage report
pnpm run setup            # Initial setup
pnpm run dev:seed-data    # Seed dev data
```

### Git Hooks

Pre-commit hooks via Husky:
- ESLint on staged JS/JSX
- Prettier formatting
- Test validation

## Testing

```bash
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
pnpm run test:ui           # UI mode
pnpm run test:coverage     # With coverage
```

## Architecture

- **Components**: `src/components/`
- **Hooks**: `src/hooks/` (data fetching, state management)
- **Utils**: `src/utils/` (helpers, services)
- **Styling**: Tailwind for layout, CSS Modules for theming
- **Themes**: Dynamic switching via CSS custom properties

See [docs/architecture.md](docs/architecture.md) for details.

## Content Management

### Contentful

Setup guide: [docs/CONTENTFUL_SETUP.md](docs/CONTENTFUL_SETUP.md)

### Fallback Data

App falls back to `src/dev-data/` when:
- Contentful unavailable
- No API keys
- Network failures

## Theme Development

1. Add theme to `src/index.css`
2. Update `App.jsx` theme logic
3. Add component styles with CSS Modules
4. Test all components

## Deployment

### Netlify

- Auto-deploy from `main` branch
- Build: `pnpm run build`
- Publish: `dist/`
- Node: 25.2.1
- Set env vars in Netlify UI

### Other Platforms

```bash
pnpm run build
# Upload dist/ directory
# Configure env vars in platform UI
```

## License

MIT
