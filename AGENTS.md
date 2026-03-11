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
2. **Branching**: Create a feature branch using `git feature` (GitNow) or manual naming:
   - Preferred: `git feature issue-[ID]-brief-description` → `feature/issue-[ID]-brief-description`
   - Alternative prefixes: `feat/`, `fix/`, `hotfix/`, `chore/`, `docs/`, `refactor/`
   - Pre-commit hook enforces valid branch names
3. **Implementation**: Work on the branch. Ensure tests pass if applicable.
4. **Pull Request**: Open a PR linking to the issue (e.g., "Closes #ID").
5. **Preview & Test**: Verify changes via the Netlify Deploy Preview link generated on the PR.
6. **Merge**: Only merge to `main` after the preview is verified and any CI checks pass.

**GitNow Setup:**

```bash
# Install GitNow (Fish shell)
fisher install joseluisq/gitnow

# Create feature branch
git feature issue-123-add-login
# Creates: feature/issue-123-add-login
```

### Issue Readiness Protocol

**CRITICAL**: Before implementing any issue, verify it has the `ready_for_dev` label.

**When Uli says "work on issue #[N]":**

1. Check if issue #[N] has the `ready_for_dev` label
2. If **YES**: Proceed with implementation
3. If **NO**: Stop and report:
   - Current issue status and labels
   - Blocker: Issue not marked ready for development
   - Suggested next steps (add label, clarify requirements, etc.)

**Why this matters:**

- Prevents work on half-baked requirements
- Ensures issues have proper context and acceptance criteria
- CI gate will block PRs linked to non-ready issues

**Label check command:**

```bash
gh issue view [N] --json number,title,labels,state
```

## Build Configuration

- **Vite** for fast development and optimized builds
- **React SWC** for faster compilation
- **Image optimization** via vite-plugin-imagemin
- **ESLint** for code quality
- **Prettier** for consistent formatting
- **Husky** for Git hooks management
- Never run `npm run dev` or any dev server command in this project.
