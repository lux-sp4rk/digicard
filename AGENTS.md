# AGENTS.md

Guidance for AI coding agents working on DigiCard.

## Project Intent

DigiCard is a React-based digital portfolio with dynamic theming and CMS integration. Core purpose: showcase projects, social links, and featured content across multiple visual themes.

## Stack & Tooling

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| Framework       | React 18 + Vite                           |
| Styling         | Tailwind (layout) + CSS Modules (theming) |
| CMS             | Contentful with static fallback           |
| Testing         | Vitest + React Testing Library            |
| Package Manager | **pnpm** (not npm)                        |
| Deployment      | Netlify                                   |

## Essential Commands

```bash
# Install dependencies
pnpm install

# Development (DON'T run dev server - use Docker)
pnpm run dev          # Only for Docker container

# Testing
pnpm run test         # Run tests
pnpm run test:coverage

# Code Quality
pnpm run lint
pnpm run format       # Prettier fix
pnpm run format:check

# Build
pnpm run build
```

## Git Workflow (Mandatory)

**PR-first. Never push to main.**

```bash
# Branch naming
git feature issue-123-description   # → feature/issue-123-description
# Alt: feat/, fix/, hotfix/, chore/, docs/, refactor/

# PR requirements
gh pr create --title "..." --body "Closes #ID"
```

### Issue Readiness Protocol

Before starting any issue:

```bash
gh issue view [N] --json labels
```

- **Must have**: `ready_for_dev` label
- **If missing**: Stop. Report blocker. Suggest adding label.

## Agent Roles

| Agent                 | Handles                                                            | Doesn't Handle                                |
| --------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| **Talena** (DevOps)   | Infrastructure, CI/CD, GitHub Actions, workflow scripts, PR merges | Feature implementation, React components      |
| **Arachne** (Feature) | React components, JSX, CSS, business logic, tests                  | Infrastructure, labeling, strategic decisions |

**Rule**: "How the app works" → Arachne. "How the team works" → Talena.

## Key Patterns

### Theme System

- Themes defined in: `src/index.css`
- Switching logic: `App.jsx:25-45`
- Use `clsx` for conditional classes

### Project Data

- Source: `src/components/Projects/Projects.jsx`
- Sorting: `order` field (number)

### Testing

- Location: `test/` directory
- Pattern: `*.test.{js,jsx}`
- Coverage threshold: 80%

## Quick References

- Architecture: `docs/architecture.md`
- Contentful setup: `docs/CONTENTFUL_SETUP.md`
- Pre-commit hooks: `.husky/pre-commit`
- Vitest config: `vitest.config.js:12-14` (coverage reporters)

## Constraints

- Node: v25.2.1 (see `.nvmrc`)
- No dev server in host environment (Docker only)
- Pre-commit hooks enforce lint/format
- Branch naming enforced via hooks
