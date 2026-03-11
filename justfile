# Justfile - Digicard Tasks
# Usage: just <recipe>

# Default recipe
default:
    @just --list

# Install dependencies
install:
    npm install

# Run dev server
dev:
    npm run dev

# Build for production
build:
    npm run build

# Run linting
lint:
    npm run lint

# Type check
types:
    npx tsc --noEmit

# Clean build artifacts
clean:
    rm -rf .next/
    rm -rf node_modules/.cache/

# Full check (lint + types + build)
check: lint types build

# Deploy (customize for your setup)
deploy: build
    echo "Deploy would happen here"

# Show git status
status:
    git status -sb

# Quick commit
commit msg:
    git add -A && git commit -m "{{msg}}"
