#!/bin/bash

# Maintenance script for Git repositories in ~/Projects
# Scans for stale branches (>14 days), prunes worktrees, and identifies active worktrees.

PROJECTS_DIR="$HOME/Projects"
STALE_DAYS=14
STALE_DATE=$(date -d "$STALE_DAYS days ago" +%Y-%m-%d)

echo "--------------------------------------------------"
echo "Git Maintenance Report - $(date)"
echo "Scanning: $PROJECTS_DIR"
echo "Stale threshold: $STALE_DAYS days ($STALE_DATE)"
echo "--------------------------------------------------"

# Find all directories containing a .git folder (up to 3 levels deep)
find "$PROJECTS_DIR" -maxdepth 3 -name ".git" -type d | while read -r gitdir; do
    repo_path=$(dirname "$gitdir")
    repo_name=$(basename "$repo_path")

    echo -e "\n\033[1;34mRepo: $repo_name\033[0m ($repo_path)"
    
    cd "$repo_path" || continue

    # 1. Prune stale worktree metadata (safe)
    git worktree prune
    
    # 2. List active worktrees
    worktrees_count=$(git worktree list | wc -l)
    if [[ $worktrees_count -gt 1 ]]; then
        echo "  [!] Active Worktrees ($worktrees_count):"
        git worktree list | sed 's/^/      /'
    fi

    # 3. Identify stale branches
    stale_branches=$(git for-each-ref --sort=-committerdate refs/heads/ \
        --format='%(committerdate:short) %(refname:short)' | awk -v d="$STALE_DATE" '$1 < d')
    
    if [[ -n "$stale_branches" ]]; then
        echo "  [!] Stale Branches (> $STALE_DAYS days):"
        echo "$stale_branches" | sed 's/^/      /'
    else
        echo "  [✓] No stale branches."
    fi

done

echo -e "\n--------------------------------------------------"
echo "Maintenance Scan Complete."
