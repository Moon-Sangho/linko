#!/bin/bash
# PreToolUse hook — validates `gh pr create` before execution.
# Exit 0: allow. Exit 2: block and return message to Claude.

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))")

# Only intercept `gh pr create`
if ! echo "$command" | grep -q "gh pr create"; then
  exit 0
fi

errors=()

# --- Validate PR title ---
title=$(echo "$command" | grep -o '\-\-title "[^"]*"' | sed 's/--title "\(.*\)"/\1/')

TITLE_REGEX='^(feat|fix|perf|test|docs|refactor|build|ci|chore|revert)(\([a-zA-Z0-9]+\))?!?: [A-Z].+[^.]$'
if [ -z "$title" ]; then
  errors+=("PR title could not be extracted from the command.")
elif ! echo "$title" | grep -qE "$TITLE_REGEX"; then
  errors+=("PR title does not follow the required format.")
  errors+=("  Current : \"$title\"")
  errors+=("  Expected: type(scope): Summary  (e.g. feat(renderer): Add search)")
fi

# --- Validate PR body structure ---
body=$(echo "$command" | python3 -c "
import sys, re
cmd = sys.stdin.read()
m = re.search(r\"--body \\\"\$(cat <<'EOF'\n(.*?)\nEOF\n)\\\"\", cmd, re.DOTALL)
if not m:
    m = re.search(r'--body \"\$\(cat <<\'EOF\'\n(.*?)\nEOF', cmd, re.DOTALL)
if m:
    print(m.group(1))
" 2>/dev/null)

required_sections=("## Summary" "## Changes" "## Checklist")
for section in "${required_sections[@]}"; do
  if ! echo "$command" | grep -qF "$section"; then
    errors+=("PR body is missing required section: $section")
  fi
done

# --- Check for unchecked checklist items ---
if echo "$command" | grep -q '\- \[ \]'; then
  errors+=("PR body contains unchecked checklist items (- [ ]).")
  errors+=("  Please confirm each item with the user before proceeding.")
fi

# --- Report ---
if [ ${#errors[@]} -gt 0 ]; then
  echo "PR validation failed. Fix the issues below and retry. Do NOT ask the user."
  echo "Reference .claude/commands/git-create-pr.md and .claude/rules/ to resolve each item."
  echo ""
  for err in "${errors[@]}"; do
    echo "  $err"
  done
  exit 2
fi

exit 0
