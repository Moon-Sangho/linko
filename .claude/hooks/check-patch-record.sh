#!/bin/bash
# PreToolUse hook — ensures a patch record exists in .context/current/patches/
# before any non-feat, non-breaking commit is made.
#
# release-please convention:
#   feat                    → minor  (skip)
#   feat! / BREAKING CHANGE → major  (skip)
#   everything else         → patch  (ask user)
#
# Patch naming rules: .context/README.md → Patches section
#
# Exit 0: allow. Exit 2: block with message to Claude.

input=$(cat)
command=$(echo "$input" | python3 -c "import sys,json; d=json.load(sys.stdin, strict=False); print(d.get('tool_input',{}).get('command',''))")

# Only intercept git commit commands
if ! echo "$command" | grep -qE 'git commit'; then
  exit 0
fi

# Skip if major: feat! or BREAKING CHANGE present
if echo "$command" | grep -qE 'feat(\([^)]*\))?!:' || echo "$command" | grep -q 'BREAKING CHANGE'; then
  exit 0
fi

# Skip if minor: plain feat (no !)
if echo "$command" | grep -qE 'feat(\([^)]*\))?:'; then
  exit 0
fi

# Remaining types (fix, perf, refactor, test, docs, build, ci, chore) → patch
# Verify this is actually a conventional commit
if ! echo "$command" | grep -qE '(fix|perf|refactor|test|docs|build|ci|chore)(\([^)]*\))?:'; then
  exit 0
fi

# Check if a patch was created recently (within last 60 minutes)
patches_dir=".context/current/patches"
if [ -d "$patches_dir" ]; then
  # Find patches modified in the last 60 minutes
  recent_patch=$(find "$patches_dir" -maxdepth 1 -type d -name "[0-9][0-9][0-9]-*" -mmin -60 2>/dev/null | head -1)
  if [ -n "$recent_patch" ]; then
    # Recent patch found — allow commit
    exit 0
  fi
  # Determine next patch number for user prompt
  last=$(ls "$patches_dir" | grep -E '^[0-9]{3}-' | sort | tail -1 | grep -oE '^[0-9]{3}')
  next=$(printf "%03d" $(( 10#${last:-000} + 1 )))
else
  next="001"
fi

# No recent patch found — ask the user via Claude
echo "PATCH_DOC_CHECK: This is a patch-level commit."
echo ""
echo "Ask the user exactly this (Yes/No):"
echo "  'Shall I write the patch document for you?'"
echo ""
echo "If Yes → run 'git diff HEAD' and 'git status' to understand the changes, then"
echo "         create the patch record following .context/README.md (Patches section):"
echo "           Path : $patches_dir/${next}-<kebab-description>/spec.md"
echo "           Name : describes the concern, not the action (e.g. 'url-suggest', not 'fix-url-bug')"
echo "           NNN  : $next (next available sequence number)"
echo "         Then retry the commit."
echo "If No  → proceed with the commit as-is."
exit 2
