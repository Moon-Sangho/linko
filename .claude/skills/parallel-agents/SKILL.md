---
name: parallel-agents
description: Strategy for coordinating multiple parallel agents without file conflicts or spec drift. Use when orchestrating sub-agents to work in parallel on the same codebase.
disable-model-invocation: true
---

# Parallel Agent Coordination Strategy

## The Problem

When a main agent spawns multiple sub-agents with overlapping file scopes,
two categories of failure occur:

1. **File conflicts** — agents overwrite each other's work because they own
   the same directories (e.g. all agents write to `src/renderer/`)
2. **Spec drift** — each agent interprets the design document differently,
   producing inconsistent interfaces, naming, and behavior

---

## Core Principle: Contract-First, Then Partition

Parallelism is only safe **after** shared contracts are frozen. Never
parallelize before interfaces are agreed upon.

```
Phase 1 (sequential) → Freeze contracts
Phase 2 (parallel)   → Implement within strict file boundaries
Phase 3 (sequential) → Integrate
```

---

## Phase 1 — Freeze Contracts (Sequential, Must Complete First)

Before spawning any parallel agents, one agent (the orchestrator) must:

### 1a. Extract all shared interfaces
Write `contracts.md` to the **triggering context folder**:
- Patch work → `.context/patches/NNN-description/contracts.md`
- QA-triggered → `.context/qa/NNN-YYYY-MM-DD-tag/2-contracts.md`

```markdown
## Component Props Contracts
- BookmarkCard: { bookmark: Bookmark; onDelete: (id: string) => void }
- SearchBar: { value: string; onChange: (v: string) => void }

## Store Contracts
- useBookmarkStore: { bookmarks: Bookmark[]; fetchAll(): void; add(b): void }

## Hook Contracts
- useSearch(query: string): { results: Bookmark[]; isLoading: boolean }
```

### 1b. Assign file ownership
Write `file-ownership.md` to the same triggering context folder as `contracts.md`.

```markdown
## Agent A — components
OWNS:
- src/renderer/components/BookmarkCard.tsx
- src/renderer/components/TagBadge.tsx
- src/renderer/components/EmptyState.tsx
MUST NOT TOUCH:
- src/renderer/store/
- src/renderer/hooks/
- src/renderer/App.tsx

## Agent B — store + hooks
OWNS:
- src/renderer/store/bookmarkStore.ts
- src/renderer/hooks/useSearch.ts
- src/renderer/hooks/useBookmarks.ts
MUST NOT TOUCH:
- src/renderer/components/
- src/renderer/App.tsx

## Agent C (Integration, runs last)
OWNS:
- src/renderer/App.tsx
```

### 1c. Rules for shared files

| File type | Rule |
|-----------|------|
| `src/shared/types.ts` | Orchestrator writes once before parallel phase. Sub-agents read only. |
| `src/shared/ipc-channels.ts` | Same as types.ts — read only during parallel phase |
| `App.tsx` / root component | Only the Integration Agent writes this |

> **No barrel exports** — do not create `index.ts` re-export aggregators.
> Import directly from the file that owns the export.
> See `.claude/rules/import-conventions.md`.

---

## Phase 2 — Parallel Implementation

Each sub-agent receives a **Task Card** — a precise, self-contained prompt.

### Task Card Template

```
You are implementing [FEATURE] for the [AGENT NAME] partition.

## Your Files (you may ONLY create/edit these)
- src/renderer/[path/to/file1.tsx]
- src/renderer/[path/to/file2.tsx]

## Contracts to Implement
[Copy relevant section from contracts.md]

## Types Available (read-only, do not modify)
- src/shared/types.ts

## IPC Channels Available (read-only)
- src/shared/ipc-channels.ts

## DO NOT TOUCH
- src/renderer/App.tsx
- src/renderer/components/index.ts
- src/renderer/store/index.ts
- Any file not listed in "Your Files"

## Definition of Done
- [ ] All props/interfaces match contracts.md exactly
- [ ] Cross-directory imports use path aliases (`@renderer/...`, `@shared/...`)
- [ ] Same-directory imports use relative paths (`./FileName`)
- [ ] No barrel index.ts files — import directly from source files
- [ ] Build passes (pnpm build:renderer)
```

---

## Phase 3 — Integration (Sequential)

One agent (Integration Agent) runs after all parallel work is done:

1. Read all files produced by parallel agents
2. Write barrel exports (`index.ts` files)
3. Wire components into `App.tsx`
4. Resolve any type mismatches
5. Run `pnpm build` and fix errors

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails | Fix |
|---|---|---|
| All agents own `src/renderer/` | Overlapping writes cause conflicts | Partition to sub-directories |
| Agents modify `types.ts` | Concurrent changes → divergent types | Orchestrator writes types.ts first |
| Creating barrel `index.ts` files | Blocks tree-shaking; not used in this project | Import directly from source files |
| No contracts before parallel phase | Each agent invents its own interfaces | Freeze contracts.md before parallelizing |
| Agents interpret design docs directly | Different readings → inconsistent output | Orchestrator extracts concrete contracts from design docs |

---

## Quick Reference: What to Write Before Parallelizing

```
Patch-triggered:
  .context/patches/NNN-description/
  ├── spec.md
  ├── contracts.md        ← all shared interfaces, prop types, store shapes
  └── file-ownership.md   ← which agent owns which files

QA-triggered:
  .context/qa/NNN-YYYY-MM-DD-tag/
  ├── 1-qa-report.md
  ├── 2-contracts.md
  └── 2-file-ownership.md

Always available (written by /agent-dev-core, read-only during parallel work):
  .context/implementation/ipc-api.md
```

`contracts.md` and `file-ownership.md` are the prerequisite for any parallel agent work.
`implementation/ipc-api.md` is written by `/agent-dev-core` and must exist before parallel work begins.
