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

## Subagent Testing Guidelines

⚠️ **When running tests as a subagent**, use safe commands to prevent orphaned Vitest processes:

```bash
# Safe commands (use these)
pnpm run test:safe           # Single-run tests with guaranteed cleanup
pnpm run test:coverage:safe  # Coverage with guaranteed cleanup
pnpm run test:cleanup        # Emergency: kill all vitest processes

# Dangerous - never use in subagents
pnpm run test:watch          # Creates persistent processes
pnpm run test:coverage:watch # Same issue
```

**Why:** Subagents use isolated bash sessions where Vitest workers don't receive termination signals, leaving orphaned processes consuming 100%+ CPU. The `test:safe` commands use `scripts/test-with-cleanup.js` which guarantees cleanup via signal handlers and force-kill fallbacks.

See also: `test-driven-development` skill for full testing guidelines.
