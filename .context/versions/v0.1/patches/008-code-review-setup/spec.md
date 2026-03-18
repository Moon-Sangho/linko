# Patch: Code Review Skill and Command Setup

**Date**: 2026-03-18
**Type**: chore
**Scope**: tools

## Problem

No integrated code review tooling aligned with project conventions.
Review checks had to reference multiple documents separately.

## Solution

- Added `typescript-react-reviewer` skill to project (`skills-lock.json`)
- Created `/code-review` command (`.claude/commands/code-review.md`) that:
  - Applies full `typescript-react-reviewer` checklist (critical, high priority, style)
  - Cross-references project-specific rules (renderer IPC, Electron security, conventions)
  - Provides structured output format (per-file, priority-grouped findings)
- Added `.agents/` to `.gitignore` (generated artifacts from `npx skills`)

## Impact

- Code reviews now have a consistent, documented baseline
- Single command (`/code-review`) covers both skill checks + project rules
- Skill dependency is tracked in version control via `skills-lock.json`
