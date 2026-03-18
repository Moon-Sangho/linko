---
description: Review changed TypeScript/React code against typescript-react-reviewer checklist and project conventions
---

# Code Review

Review all TypeScript/React files changed in this branch using the `typescript-react-reviewer` skill and project-specific rules.

## Steps

1. **Identify changed files**:
   ```bash
   git diff main...HEAD --name-only
   ```
   Focus on `.ts` and `.tsx` files. Skip generated files, config, and lock files.

2. **Read each changed file** and apply the checks below.

3. **Output findings** grouped by file, using the priority format at the bottom.

---

## Checklist 1 — TypeScript + React (`typescript-react-reviewer`)

### 🚫 Critical

| Pattern | Problem |
|---------|---------|
| `useEffect` setting state derived from other state | Extra render cycle, sync bugs |
| Missing cleanup function in `useEffect` (timers, subscriptions, listeners) | Memory leak |
| Direct state mutation — `.push()`, `.splice()`, `arr[i] =` before `setState` | Silent update failure |
| Hook called conditionally or inside loop | Breaks Rules of Hooks |
| `key={index}` on dynamic lists where items can reorder or be deleted | State corruption |
| `any` type without comment justification | Type safety bypass |
| `useFormStatus` used in the same component that renders `<form>` | Always returns `false` (React 19) |
| New `Promise` created inline during render passed to `use()` | Infinite loop |

### ⚠️ High Priority

| Pattern | Problem |
|---------|---------|
| `useEffect` dependency array missing used variables | Stale closure |
| Props typed as `any` or `object` | Runtime errors |
| `useMemo`/`useCallback` with no measurable benefit | Premature optimization |
| Missing Error Boundary around async/suspense boundaries | Crash surfaces to user |
| Controlled input initialized with `undefined` | React uncontrolled→controlled warning |
| `eslint-disable react-hooks/exhaustive-deps` | Hides stale closure bug — refactor instead |
| Component defined inside another component | Remounts on every parent render |

### 📝 Architecture / Style

| Pattern | Recommendation |
|---------|----------------|
| Component > 150 lines (project rule) | Split into smaller components |
| Prop drilling > 2–3 levels | Use composition or context |
| State defined far from the only component that uses it | Colocate state |
| Custom hook missing `use` prefix | Rename to follow convention |
| `React.FC` with generics | Use explicit props function instead |
| Server/async data copied into `useState` + `useEffect` | Use TanStack Query directly as source of truth |

---

## Checklist 2 — Project Conventions (`.claude/rules/`)

### Renderer process (`src/renderer/`)

- [ ] No `import fs`, `import path`, `require('better-sqlite3')`, or any Node.js API
- [ ] All main-process calls use `window.electron.invoke(IpcChannels.XXX)` — no direct `ipcRenderer`
- [ ] Cross-directory imports use absolute aliases (`@renderer/`, `@shared/`) not relative `../../`
- [ ] No `index.ts` barrel re-exports
- [ ] One component per file; props interface defined in the same file

### Main process (`src/main/`)

- [ ] IPC handlers call repository methods — no raw SQL outside `src/main/db/`
- [ ] Mutations return `{ success: true, data }` or `{ success: false, error: string }`
- [ ] IPC channel names follow `domain:action` format (defined in `src/shared/ipc-channels.ts`)
- [ ] Repository injected as parameter — not imported directly in handlers

### Electron security

- [ ] All `BrowserWindow` instances have `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- [ ] `preload.ts` uses `contextBridge` only — does not expose `ipcRenderer` directly
- [ ] No `webSecurity: false`, no `remote` module usage

### Shared types

- [ ] New types go in `src/shared/types.ts`
- [ ] New IPC channel names go in `src/shared/ipc-channels.ts`
- [ ] No type declarations duplicated between `main` and `renderer`

---

## Output Format

Report per file. Omit sections with no findings.

```
### src/renderer/components/BookmarkCard.tsx

🚫 Critical
- Line 42: `useEffect` sets `displayTitle` derived from `bookmark.title` — compute during render instead.

⚠️ High Priority
- Line 67: `onDelete` prop typed as `any` — use `(id: string) => void`.

📝 Style
- Line 1: Import `useBookmarkStore` uses relative path `../../store/bookmarkStore` — use `@renderer/store/bookmarkStore`.
```

End with a one-line summary:

> **Result: X critical, Y high priority, Z style issues across N files.**

If no issues are found: **"No issues found."**

$ARGUMENTS
