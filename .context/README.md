# .context - Agent Collaboration Space

Inter-agent output files. Written by one agent, read by the next.
This directory is git-tracked.

## Folder Structure

```
.context/
├── current/          ← always the latest; all agents read from here
│   ├── planning/
│   │   ├── requirements.md
│   │   ├── user-stories.md
│   │   └── scope.md
│   ├── design/
│   │   ├── design-system.md
│   │   ├── screens.md
│   │   └── components.md
│   ├── implementation/
│   │   └── ipc-api.md
│   └── qa/
│       └── NNN-YYYY-MM-DD-<tag>/  ← full cycle history (never deleted)
│           ├── 1-qa-report.md       ← agent-dev-qa: issues found
│           ├── 2-contracts.md       ← agent-orchestrate: interface contracts
│           ├── 2-file-ownership.md  ← agent-orchestrate: file boundaries
│           └── 3-verification.md    ← agent-dev-qa: issues resolved
└── versions/         ← snapshots at milestone boundaries
    └── v0.1/
        ├── planning/
        ├── design/
        ├── implementation/
        ├── qa/
        │   └── NNN-YYYY-MM-DD-<tag>/  ← 1-qa-report, 2-contracts, 2-file-ownership, 3-verification
        └── patches/  ← bug fixes and small improvements within this release
            ├── 001-short-description/
            │   └── spec.md
            └── 002-short-description/
                └── spec.md
```

## Versioning Rule

**Each release gets its own versioned directory under `versions/`.** Never edit a past version's files — they are immutable snapshots.

### At a release boundary (e.g. v0.1 → v0.2)

```bash
# 1. Create a new versioned directory for the new release
mkdir -p .context/versions/v0.2/{planning,design,implementation,qa}

# 2. Update the current symlink to point to the new version
rm .context/current
ln -s versions/v0.2 .context/current

# 3. v0.1 is now an immutable snapshot — do not edit it
```

- During active work, read and write only to `current/` (= current version directory)
- Previous versions can be referenced directly at `versions/vX.X/`

Each version (v0.1, v0.2, ...) represents a product release.
The phases within it (planning → design → implementation → qa) build up to a single release.

## QA Runs

A QA run is the full fix cycle: issue report → task distribution → verification.
Each run lives in `current/qa/` (resolved: `versions/vX.X/qa/`) as a numbered folder.

### Folder naming

```
NNN-YYYY-MM-DD-<tag>/
```

- `NNN` — zero-padded sequence (001, 002, ...)
- `<tag>` — describes the trigger

| Tag | When |
|-----|------|
| `initial` | First QA run for this version |
| `post-fix` | After resolving a batch of issues |
| `pre-release` | Final gate before a release |
| `regression` | Scheduled or incident-driven check |

### Files within a run

| File | Written by | When |
|------|-----------|------|
| `1-qa-report.md` | `agent-dev-qa` | Step 1 — issues found |
| `2-contracts.md` | `agent-orchestrate` | Phase 1 — component/store interface contracts |
| `2-file-ownership.md` | `agent-orchestrate` | Phase 1 — per-agent file boundaries |
| `3-verification.md` | `agent-dev-qa` | Step 3 — issues resolved confirmation |

Files `2-*.md` and `3-verification.md` are optional — a run may stop at `1-qa-report.md` if no fixes were needed or if the cycle is in progress.

Working files `current/implementation/contracts.md` and `current/implementation/file-ownership.md` remain the source of truth for sub-agents during active work. The `2-*.md` files are snapshots saved after Phase 1 completes.

### Examples

```
versions/v0.1/qa/001-2026-03-18-initial/
versions/v0.1/qa/002-2026-03-25-post-fix/
versions/v0.1/qa/003-2026-04-01-pre-release/
```

### What goes where

| Location | What it holds |
|----------|---------------|
| `current/qa/NNN-YYYY-MM-DD-<tag>/` | Full cycle record — issue → fix plan → verification |
| `versions/vX.X/qa/` | All QA cycles for that release (never deleted) |

Working files `contracts.md` and `file-ownership.md` stay in `current/implementation/` for sub-agents to read. Only the snapshot goes into the run folder at Step 9 of orchestration.

The latest QA result is always the highest-numbered run folder's most recent file.

| Milestone | Snapshot path | Completion criteria |
|-----------|--------------|---------------------|
| planning | `versions/v0.X/planning/` | /agent-pm outputs complete |
| design | `versions/v0.X/design/` | /agent-designer outputs complete |
| implementation | `versions/v0.X/implementation/` | /agent-dev-core + dev-ui complete |
| qa | `versions/v0.X/qa/` | /agent-dev-qa complete |

## Patches

A patch is any change that does **not** start a new feature release cycle —
bug fixes, small UX improvements, hardening, minor refactors.

### When to create a patch

Create a new `NNN-description/` directory under `current/patches/` (= the active version's patches folder) for each logical unit of work.

### Numbering and naming

- 3-digit zero-padded sequence: `001`, `002`, ...
- Hyphenated, describes the concern — not the action
  - ✅ `005-url-suggest`
  - ❌ `005-fix-url-input-bug`

### spec.md format

```markdown
# Patch NNN — <Title>

**Date:** YYYY-MM-DD
**Agents involved:** <Dev UI / Dev Core / ...>

## Problem
## Decision
## Changes

### `path/to/file.ts`
- what changed and why
```

**Rules:**
- No commit hash or PR number — use `git log` / GitLens for history
- All changes belonging to the same logical fix go under `## Changes` at the
  same heading level — do not add sub-sections like "Follow-up Changes"
- Follow-ups to the same concern → add to the existing patch
- Different concern → new patch number

---

## Output Files

| File | Written by | Read by |
|------|------------|---------|
| `planning/requirements.md` | `/agent-pm` | designer, dev-core, dev-ui, qa |
| `planning/user-stories.md` | `/agent-pm` | designer, dev-core |
| `planning/scope.md` | `/agent-pm` | all agents |
| `design/design-system.md` | `/agent-designer` | dev-ui |
| `design/screens.md` | `/agent-designer` | dev-ui |
| `design/components.md` | `/agent-designer` | dev-ui |
| `implementation/ipc-api.md` | `/agent-dev-core` | dev-ui, dev-qa |
| `qa/NNN-.../1-qa-report.md` | `/agent-dev-qa` | `/agent-orchestrate` |

## Agent Execution Order

```
1. /agent-pm          → requirements.md, user-stories.md, scope.md
2. /agent-designer    → design-system.md, screens.md, components.md
3. /agent-dev-core    → src/main/, src/shared/, .context/ipc-api.md
   /agent-dev-ui      → src/renderer/  (can run in parallel with dev-core)
4. /agent-dev-qa      → qa/NNN-YYYY-MM-DD-<tag>/1-qa-report.md
```

---

## Parallel Agent Workflow

Process for running multiple `/agent-dev-ui` agents in parallel.
`/agent-orchestrate` coordinates the whole flow to prevent conflicts.

### Related Files

| File | Role |
|------|------|
| `.claude/commands/agent-orchestrate.md` | Orchestrator role definition |
| `.claude/skills/parallel-agents/SKILL.md` | Parallel coordination strategy (contract-first) |
| `.claude/rules/renderer-conventions.md` | Renderer coding conventions |
| `.claude/rules/main-conventions.md` | Main process coding conventions |
| `.claude/rules/electron-security.md` | Electron security checklist |
| `.claude/rules/import-conventions.md` | Absolute paths, no barrel exports |

### Process Overview

```
Phase 1 — Contract freeze (orchestrator, sequential)
  ├── Finalize src/shared/types.ts
  ├── Finalize src/shared/ipc-channels.ts
  ├── Write current/implementation/contracts.md   ← all interface specs
  └── Write current/implementation/file-ownership.md ← per-agent file boundaries

Phase 2 — Parallel implementation (sub-agents, concurrent)
  ├── Agent A: implements only the components partition
  ├── Agent B: implements only the store/hooks partition
  └── Each agent modifies only files assigned in file-ownership.md

Phase 3 — Review (orchestrator, sequential)
  ├── Verify contracts.md compliance (interface match)
  ├── Check for rules/ violations (imports, security, patterns)
  └── Check for file boundary violations

Phase 4 — Fix + integration (orchestrator, sequential)
  ├── Fix any violations directly
  ├── Write App.tsx integration (direct imports, no barrels)
  └── Confirm pnpm build passes
```

### Files Created During Parallel Work

```
current/implementation/
├── contracts.md       ← written by orchestrator in Phase 1
├── file-ownership.md  ← written by orchestrator in Phase 1
└── ipc-api.md         ← written by /agent-dev-core (existing)
```

When orchestration is triggered by a QA report, Phase 1 artifacts are also copied to the active run folder as `2-contracts.md` and `2-file-ownership.md` (Step 9).

### Core Rules

- **No parallel work before contract freeze** — starting parallel without contracts.md causes interface conflicts
- **Sub-agents touch only their own files** — modifying files outside file-ownership.md is prohibited
- **Shared files are orchestrator-only** — `src/shared/types.ts`, `ipc-channels.ts`, `App.tsx`
- **No barrel exports** — do not create `index.ts` re-export files; use direct imports
