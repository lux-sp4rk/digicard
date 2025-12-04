# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DigiCard is a React-based digital portfolio/business card application featuring multiple dynamic themes and interactive console easter eggs. The application showcases projects, social links, and a featured post in various visual styles.

## Architecture

See [docs/architecture.md](docs/architecture.md) for a high-level, ever-green overview of the technical architecture of the application.

## Development

### Core Commands

- `npm install` - Install dependencies
- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint with error reporting
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Git Hooks

- Pre-commit hooks are configured via Husky to run linting and formatting
- Lint-staged runs ESLint and Prettier on staged files before commits

### Theme Development

- New themes require CSS class additions in `src/index.css`
- Theme switching logic in `App.jsx` handles body class management
- Component styling uses conditional classes with `clsx`

### Project Management

- Projects are defined in `Projects.jsx` with order-based sorting
- Image optimization is handled by Vite plugin
- Different image variants can be used based on layout requirements

### Console Easter Eggs

- Interactive commands are defined in `consoleEasterEgg.js`
- Commands can trigger theme changes and special effects
- Cleanup function provided for proper component unmounting

## Build Configuration

- **Vite** for fast development and optimized builds
- **React SWC** for faster compilation
- **Image optimization** via vite-plugin-imagemin
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Husky** for Git hooks management
- remember that this is a solo project, so there is no need for team workflows. optimize for solo dev with LLM
