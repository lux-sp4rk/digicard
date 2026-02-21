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

### Git & PR Workflow (Mandatory)

This repository enforces a **PR-first workflow**. No direct pushes to `main`.

1. **Issue First**: Every change must start with a GitHub Issue.
2. **Branching**: Create a feature branch named `feat/issue-[ID]-[brief-description]`.
3. **Implementation**: Work on the branch. Ensure tests pass if applicable.
4. **Pull Request**: Open a PR linking to the issue (e.g., "Closes #ID").
5. **Preview & Test**: Verify changes via the Netlify Deploy Preview link generated on the PR.
6. **Merge**: Only merge to `main` after the preview is verified and any CI checks pass.

## Build Configuration

- **Vite** for fast development and optimized builds
- **React SWC** for faster compilation
- **Image optimization** via vite-plugin-imagemin
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Husky** for Git hooks management
- Never run `npm run dev` or any dev server command in this project.
