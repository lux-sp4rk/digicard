#!/usr/bin/env bash
# Council of Hunters - Arachne orchestrates 3 agents to review PR
# Usage: ./council-of-hunters.sh PR_NUMBER

set -e

PR_NUM="${1:-}"
if [[ -z "$PR_NUM" ]]; then
    echo "Usage: $0 PR_NUMBER"
    echo "Example: $0 61"
    exit 1
fi

REPO=$(gh repo parse --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "lux-sp4rk/digicard")
BRANCH=$(gh pr view "$PR_NUM" --json headRefName -q .headRefName)
BASE=$(gh pr view "$PR_NUM" --json baseRefName -q .baseRefName)

echo "🏆 Summoning the Council of Hunters..."
echo "PR: #$PR_NUM ($BRANCH → $BASE)"
echo ""

# Get changed files
echo "📂 Getting changed files..."
FILES=$(gh pr diff "$PR_NUM" --name-only 2>/dev/null | head -20 | tr '\n' ' ')
echo "Files: $FILES"

# Prompt for each hunter
VETERAN_PROMPT="You are The Paranoid Veteran, a grizzled code hunter who's seen every bug in the multiverse. Review these files for edge cases, null pointers, race conditions, memory leaks, and classic bugs. Be paranoid. Files to review:
$FILES

Respond in format:
## Paranoid Veteran Findings
- [issue description with file:line]
- ...

If nothing critical, say 'CLEAR'."

WILDCARD_PROMPT="You are The Wildcard - half naive rookie, half occult specialist. Ask naive questions ('what if a kid types SQL here?') AND find weird edge cases (CSS combos, cross-system race conditions, bizarre interactions). Files to review:
$FILES

Respond in format:
## Wildcard Findings  
- [issue description with file:line]
- ...

If nothing critical, say 'CLEAR'."

FAYE_PROMPT="You are Test Runner Faye, an expert in test coverage and edge cases in tests. Review these files for missing test coverage, untested edge cases, and test quality. Files to review:
$FILES

Respond in format:
## Faye Findings
- [issue description with file:line]
- ...

If nothing critical, say 'CLEAR'."

# Spawn all three hunters in parallel (this is a placeholder - would need actual subagent spawning)
# For now, just echo what would happen
echo ""
echo "🎭 Spawning hunters..."
echo ""
echo "1. Paranoid Veteran: $FILES"
echo "2. Wildcard: $FILES"
echo "3. Test Runner Faye: $FILES"
echo ""

# In real implementation, we'd use sessions_spawn or similar
# For now, create a stub that shows the flow
cat > /tmp/council-findings.md << 'EOF'
## 🏆 Council Verdict

### Critical (fix immediately)
_Placeholder for findings_

### Warning (review)
_Placeholder for findings_

---
*Council of Hunters - Powered by Arachne*
EOF

echo "📝 Would post to PR #$PR_NUM:"
echo "---"
cat /tmp/council-findings.md

# Uncomment to actually post:
# gh pr comment "$PR_NUM" --body-file /tmp/council-findings.md
