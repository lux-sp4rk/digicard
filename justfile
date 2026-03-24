# Justfile - Digicard Tasks
# Usage: just <recipe>

# Default recipe
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Run dev server (Docker-preferred, see AGENTS.md)
dev:
    pnpm run dev

# Build for production
build:
    pnpm run build

# Run linting
lint:
    pnpm run lint

# Type check
types:
    npx tsc --noEmit

# Clean build artifacts
clean:
    rm -rf dist/
    rm -rf coverage/
    rm -rf node_modules/.cache/

# Full check (lint + types + build)
check: lint types build

# Show git status
status:
    git status -sb

# Identify branches older than 14 days
cleanup-stale-branches:
    @echo "Branches older than 14 days:"
    @git for-each-ref --sort=-committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)' | awk -v d="$$(date -d '14 days ago' +%Y-%m-%d)" '$$1 < d'

# Quick commit
commit msg:
    git add -A && git commit -m "{{msg}}"

# Council of Hunters - Arachne spawns trio for code review
review:
    @echo "Summoning the Council of Hunters..."
    @echo ""
    @echo "1. Paranoid Veteran (Bug Hunter D33) - edge cases, nulls, race conditions"
    @echo "2. The Wildcard - naive questions + weird edge cases"
    @echo "3. Test Runner Faye - test coverage"
    @echo ""
    @echo "Usage: just review-council PR_NUMBER"
    @echo "This will spawn all 3 agents and post to PR"

# Actual review command - runs the council
review-council PR_NUMBER:
    @./scripts/council-of-hunters.sh {{PR_NUMBER}}
