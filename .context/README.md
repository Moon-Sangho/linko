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
│       └── qa-checklist.md
└── versions/         ← snapshots at milestone boundaries
    └── v0.1/
        ├── planning/
        ├── design/
        ├── implementation/
        ├── qa/
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
| `qa/qa-checklist.md` | `/agent-dev-qa` | — |

## Agent Execution Order

```
1. /agent-pm          → requirements.md, user-stories.md, scope.md
2. /agent-designer    → design-system.md, screens.md, components.md
3. /agent-dev-core    → src/main/, src/shared/, .context/ipc-api.md
   /agent-dev-ui      → src/renderer/  (can run in parallel with dev-core)
4. /agent-dev-qa      → electron.vite.config.ts, electron-builder.yml, qa-checklist.md
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

### Core Rules

- **No parallel work before contract freeze** — starting parallel without contracts.md causes interface conflicts
- **Sub-agents touch only their own files** — modifying files outside file-ownership.md is prohibited
- **Shared files are orchestrator-only** — `src/shared/types.ts`, `ipc-channels.ts`, `App.tsx`
- **No barrel exports** — do not create `index.ts` re-export files; use direct imports
