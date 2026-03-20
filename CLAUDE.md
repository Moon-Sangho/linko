# Linko - Bookmark Manager Desktop App

## Project Overview

Electron-based local bookmark management desktop app.
Focus: simple, fast, distraction-free bookmark management.

## Tech Stack

- **Framework**: Electron
- **Frontend**: React + TypeScript
- **Storage**: SQLite (via better-sqlite3)
- **Styling**: Tailwind CSS
- **Build**: electron-builder

## Architecture

```
Main Process (Node.js)
  ├── SQLite DB (local storage)
  ├── IPC handlers
  └── URL metadata fetcher

Renderer Process (React)
  └── communicates via IPC only (no direct Node access)
```

## Data Layer Abstraction (for future extensibility)

```
BookmarkRepository (interface)
  ├── LocalRepository  ← current
  └── RemoteRepository ← future (login-based)
```

## Project Structure

```
linko/
├── src/
│   ├── main/          # Electron main process
│   │   ├── index.ts
│   │   ├── ipc/       # IPC handlers
│   │   ├── db/        # SQLite + repositories
│   │   └── services/  # URL fetcher, etc.
│   ├── renderer/      # React app
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── store/
│   └── shared/        # Shared types between main/renderer
└── CLAUDE.md
```

## Coding Conventions

- TypeScript strict mode
- Named exports only
- Shared types live in `src/shared/types.ts`
- IPC channel names defined in `src/shared/ipc-channels.ts`
- Repository pattern for all data access

## Agent System

The `.claude/` directory contains all agent configuration for this project.

### Rules (`.claude/rules/`)
Always-on constraints applied to every agent and conversation.

| File | Scope |
|------|-------|
| `renderer-conventions.md` | IPC pattern, Zustand, component rules |
| `main-conventions.md` | Repository pattern, IPC handler structure |
| `import-conventions.md` | Absolute imports, no barrel exports |
| `electron-security.md` | BrowserWindow settings, contextBridge rules |
| `git-conventions.md` | Branch naming, commit message format |

### Agents (`.claude/agents/`)
Specialized sub-agents invoked via `/agent-*` commands.

| Agent | Responsibility |
|-------|----------------|
| `pm.md` | Requirements, user stories, MVP scope |
| `designer.md` | Design system, screen layouts, component specs |
| `dev-core.md` | Electron main process, SQLite, IPC handlers |
| `dev-ui.md` | React renderer, Zustand stores, IPC calls |
| `dev-qa.md` | QA orchestration across all sub-agents |
| `orchestrate.md` | Coordinate parallel agents, integrate output |

### Commands (`.claude/commands/`)
Slash commands available in any conversation.

| Command | Purpose |
|---------|---------|
| `/agent-pm` | Run the PM agent |
| `/agent-designer` | Run the Designer agent |
| `/agent-dev-core` | Run the Core Dev agent |
| `/agent-dev-ui` | Run the UI Dev agent |
| `/agent-dev-qa` | Run all QA agents in parallel |
| `/agent-orchestrate` | Coordinate all agents |
| `/code-review` | Review changed code against project conventions |
| `/git-commit` | Stage and commit following git conventions |
| `/git-create-pr` | Create a GitHub PR |

### Skills (`.claude/skills/`)
Reusable knowledge modules referenced by agents.

| Skill | Purpose |
|-------|---------|
| `desktop/` | Electron IPC patterns, window management, file system |
| `parallel-agents/` | Running agents in parallel with Conductor |
| `react-hook-form-writer/` | React forms with react-hook-form + Zod |

---

## Engineering Principles

- **Fix at the right layer** — prefer structural fixes over symptomatic workarounds. Ask "where should this concern actually live?" before patching. Example: a modal leaking keyboard events to a global listener should be fixed with `stopPropagation` at the modal boundary, not by checking `document.activeElement` in the listener.

## Documentation Language

- **All AI-generated documentation must be written in English** — applies to all files in `.claude/`, `docs/`, and any other project documentation
- This ensures consistency and readability across all agents
