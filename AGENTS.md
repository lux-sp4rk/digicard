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

This repo uses a **bare-repo + worktree** setup:

```
~/git/digicard.git/              # bare repo (source of truth)
~/Projects/digicard-main/        # main branch worktree
~/Projects/digicard-<branch>/    # feature branch worktrees
```

### Worktree Rules

- **Never `git checkout`** to switch branches — `cd` into the right worktree
- **Create worktrees from the bare repo:**
  ```bash
  git -C ~/git/digicard.git worktree add -b feature/my-thing ~/Projects/digicard-my-thing main
  cd ~/Projects/digicard-my-thing
  pnpm install
  ```
- **Remove worktrees properly:**
  ```bash
  git -C ~/git/digicard.git worktree remove digicard-my-thing
  ```
  Never use `rm -rf` on a worktree directory.
- **Always run `git worktree list`** to see what's checked out where

### Branch naming
```bash
git feature issue-123-description   # → feature/issue-123-description
# Alt: feat/, fix/, hotfix/, chore/, docs/, refactor/
```

### PR requirements
```bash
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

- Themes defined in: [src/index.css](src/index.css)
- Switching logic: [App.jsx:25-45](src/App.jsx:25-45)
- Use `clsx` for conditional classes

### Project Data

- Source: [src/components/Projects/Projects.jsx](src/components/Projects/Projects.jsx)
- Sorting: `order` field (number)

### Testing

- Location: `test/` directory
- Pattern: `*.test.{js,jsx}`
- Coverage threshold: 80% ([vitest.config.js:15](vitest.config.js:15))

## Quick References

- Architecture: [docs/architecture.md](docs/architecture.md)
- Contentful setup: [docs/CONTENTFUL_SETUP.md](docs/CONTENTFUL_SETUP.md)
- Pre-commit hooks: [.husky/pre-commit](.husky/pre-commit)

## Constraints

- Node: v25.2.1 (see [.nvmrc](.nvmrc))
- No dev server in host environment (Docker only)
- Pre-commit hooks enforce lint/format
- Branch naming enforced via hooks

## Subagent Testing Guidelines

⚠️ **When running tests as a subagent**, use safe commands to prevent orphaned Vitest processes:

```bash
# Safe commands (use these)
pnpm run test:safe           # Single-run with guaranteed cleanup
pnpm run test:coverage:safe  # Coverage with guaranteed cleanup
pnpm run test:cleanup        # Emergency: kill all vitest processes

# Dangerous - never use in subagents
pnpm run test:watch          # Creates persistent processes
pnpm run test:coverage:watch # Same issue
```

See also: `test-driven-development` skill for full testing guidelines.
