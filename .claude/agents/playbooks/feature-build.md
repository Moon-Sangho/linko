# Playbook: Feature Build

Coordinate parallel sub-agents to implement a feature with consistent, conflict-free output,
then review and integrate their results.

**Task**: $ARGUMENTS (passed through from the orchestrator)

---

## Reference files (read before starting)

- `.claude/skills/parallel-agents/SKILL.md` — contract-first parallel coordination
- `.claude/rules/conventions/references/imports.md`
- `.claude/rules/conventions/references/renderer.md`
- `.claude/rules/conventions/references/main.md`
- `.claude/rules/conventions/references/electron-security.md`
- `CLAUDE.md` — architecture overview
- `.context/planning/requirements.md` — feature requirements
- `.context/design/components.md` — component specs
- `.context/design/screens.md` — screen layouts
- `.context/implementation/ipc-api.md` — available IPC calls
- `src/shared/types.ts` — existing types
- `src/shared/ipc-channels.ts` — existing IPC channels

---

## Phases

```
Phase 1 (you, sequential) → Freeze contracts + write task cards
Phase 2 (sub-agents, parallel) → Implement within file boundaries
Phase 3 (you, sequential) → Review each agent's output
Phase 4 (you, sequential) → Fix violations + integrate into app.tsx
```

---

## Pre-work (Phase 1)

Run this before launching any sub-agents.

### Step 1 — Audit shared files

Read `src/shared/types.ts` and `src/shared/ipc-channels.ts`.
If any types or channels are missing for the requested feature, add them now.
These files must be frozen before parallel work begins.

### Step 2 — Extract contracts

Determine the triggering context folder, then create `contracts.md` there:
- Patch work → `.context/patches/NNN-description/contracts.md`
- QA-triggered → `.context/qa/NNN-YYYY-MM-DD-<tag>/2-contracts.md`

Include:
- All component prop interfaces
- All Zustand store shapes
- All custom hook signatures
- Exact naming (no agent should invent names)

### Step 3 — Define file ownership

Create `file-ownership.md` in the same folder as `contracts.md`.

Include:
- Agent A: exact file list (components partition)
- Agent B: exact file list (store/hooks partition)
- Explicit MUST NOT TOUCH lists for each agent

### Step 4 — Write task cards

For each parallel agent, produce a self-contained task card:

```
## Task Card: Agent [X] — [partition name]

You are implementing [description].

### Your Files (ONLY these)
- src/renderer/[file1]
- src/renderer/[file2]

### Contracts to Implement
[paste relevant interfaces from contracts.md]

### DO NOT TOUCH
[list files other agents own]

### Definition of Done
- [ ] All interfaces match contracts.md exactly
- [ ] Cross-directory imports use path aliases (@renderer/..., @shared/...)
- [ ] Same-directory imports use relative paths (./file-name)
- [ ] No barrel index.ts files created
- [ ] pnpm build:renderer passes
```

### Step 5 — Issue work order

Output all task cards clearly separated.
Wait for all sub-agents to finish before proceeding to Phase 3.

---

## Agents (Phase 2)

Launch all agent tasks simultaneously in a single message.

Each agent receives its task card as the prompt and:
- `subagent_type: "general-purpose"`
- `Working directory: <workspace-path>`

The number of agents equals the number of task cards defined in Step 4 (typically 2: components + store/hooks).

---

## Phase 3 — Review

After all sub-agents complete, read every file listed in `file-ownership.md` and verify:

### 3a. Contract compliance
- [ ] Exported interfaces/props match `contracts.md` exactly (names, types, optionality)
- [ ] No extra props or renamed fields introduced unilaterally
- [ ] Store shape matches contract (no added/removed keys)

### 3b. Import convention compliance
- [ ] No cross-directory relative imports (e.g. `../../store/use-ui-store`)
  → must use `@renderer/store/use-ui-store`
- [ ] No barrel imports (e.g. `@renderer/components`)
  → must import from the exact file
- [ ] No new `index.ts` barrel files created

### 3c. File boundary compliance
- [ ] Each agent touched only the files assigned in `file-ownership.md`
- [ ] `src/shared/types.ts` and `src/shared/ipc-channels.ts` were not modified

### Review output format

```
## Review Report

### Agent A — components
✅ Contract: OK
⚠️ Import: bookmark-card.tsx line 3 uses relative cross-dir import
   → fix: import from '@renderer/store/use-ui-store'
✅ Boundary: OK

### Agent B — store/hooks
✅ Contract: OK
✅ Import: OK
✅ Boundary: OK

### Violations to fix before integration: [N]
```

---

## Phase 4 — Fix violations + integrate

### Step 6 — Fix all violations

For each violation found in Phase 3, edit the file directly.
Do not ask sub-agents to fix — you own the fix at this stage.

Priority order:
1. Contract mismatches (breaks integration)
2. Import violations (breaks build)
3. Boundary violations (audit only — note but do not revert if output is correct)

### Step 7 — Write app.tsx integration

Wire all components into `src/renderer/app.tsx`:
- Import directly from each source file (no barrel index.ts)
- Use `@renderer/...` aliases for all imports
- Follow the screen layout in `.context/design/screens.md`

### Step 8 — Build verification

Run `pnpm build` and fix any TypeScript or bundler errors.
Do not mark the task complete until the build passes.

### Step 9 — Save to QA run folder (QA context only)

Only perform this step if triggered by a QA report (i.e. `1-qa-report.md` exists in the latest run folder).

Find the latest run folder:

```bash
ls .context/qa/ | sort | tail -1
```

Phase 1 artifacts (`2-contracts.md`, `2-file-ownership.md`) were already written into the run folder in Steps 2–3 — no copy needed.

---

## Output

Artifacts are written into the context folder determined in Step 2:
- `.context/patches/NNN-description/` for patch work
- `.context/qa/NNN-YYYY-MM-DD-<tag>/` for QA-triggered work

---

## User Report

Output a completion summary after Phase 4:

```
## Integration Complete

### Files produced
- [list all files created by sub-agents + app.tsx]

### Violations fixed
- [list each fix applied]

### Build status
✅ pnpm build passed
```

If triggered by QA, append:

```
QA run snapshots saved:
  .context/qa/<run-folder>/2-contracts.md
  .context/qa/<run-folder>/2-file-ownership.md

Next step: run /agent-dev-qa to verify issues are resolved (writes 3-verification.md).
```

---

## Rules

- You write contracts.md and file-ownership.md — no one else
- You NEVER implement components yourself in Phase 1
- You DO fix violations and write app.tsx in Phase 4
- If a partition boundary is unclear, make it explicit before proceeding
- Shared files (types.ts, ipc-channels.ts) are frozen after Step 1
