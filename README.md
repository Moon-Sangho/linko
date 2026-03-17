# Linko

A local-first bookmark manager for macOS, built with Electron.

![Linko screenshot](assets/app.webp)

---

## Background

A while back, there was a bookmark management service called **Picurate** ([피큐레잇](https://blog.naver.com/kaiba1004/222500330854)). It had exactly what browser-native bookmarks lack — proper organization, tagging, and search. I used it daily. Then the service shut down.

After that, I tried managing bookmarks in **Notion** — dedicated database, custom properties, the works. That didn't stick either. The friction of opening a browser tab just to save another browser tab never felt right.

So I decided to build my own. A local app. No accounts, no syncing to someone else's server, no service shutdowns. Just a fast, keyboard-friendly tool that lives on my machine and does one thing well.

That's Linko.

---

## Features (v0.1 MVP)

- Add bookmarks with auto-fetched title and favicon
- Edit URL, title, and notes
- Assign and filter by tags
- Full-text search across URL, title, and notes — instant results
- Import bookmarks from browser HTML export (Chrome, Firefox, Safari)
- Open bookmarks in your default browser
- All data stored locally in SQLite — no cloud dependency

---

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Framework        | Electron                         |
| Frontend         | React + TypeScript               |
| State management | Zustand                          |
| Styling          | Tailwind CSS                     |
| UI primitives    | Radix UI                         |
| Database         | SQLite (via better-sqlite3)      |
| Build            | electron-vite + electron-builder |

---

## Architecture

```
Main Process (Node.js)
  ├── SQLite database (local storage)
  ├── IPC handlers  (src/main/ipc/)
  ├── Repository layer (src/main/db/)
  └── URL metadata fetcher (src/main/services/)

Renderer Process (React)
  └── communicates via IPC only — no direct Node.js access

Shared
  ├── src/shared/types.ts         — shared TypeScript types
  └── src/shared/ipc-channels.ts  — typed IPC channel names
```

The renderer never touches SQLite directly. All data flows through typed IPC channels, which means the storage backend can be swapped (e.g. from local SQLite to a remote API) without touching any UI code.

---

## Getting Started

Requires Node.js 20+ and pnpm.

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev
```

### Build & Install on macOS

```bash
# Build and package as a DMG installer
pnpm package
```

This produces a `.dmg` file under `dist/`. To install:

1. Open the `.dmg` file
2. Drag **Linko.app** into the **Applications** folder
3. Launch Linko from Applications or Spotlight

---

## Project Structure

```
linko/
├── src/
│   ├── main/          # Electron main process
│   │   ├── index.ts
│   │   ├── preload.ts
│   │   ├── ipc/       # IPC handlers (one file per domain)
│   │   ├── db/        # SQLite schema + repositories
│   │   └── services/  # URL fetcher, importer
│   ├── renderer/      # React app
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── store/     # Zustand stores
│   └── shared/        # Types and IPC channel names
├── .context/          # Agent collaboration files (see below)
├── docs/              # Design docs, specs
└── CLAUDE.md
```

---

## How This Project Is Built

Linko is being developed almost entirely through **agentic engineering** — multiple specialized AI agents, each owning a specific part of the workflow.

### Agent Roles

| Agent                | Responsibility                                        |
| -------------------- | ----------------------------------------------------- |
| `/agent-pm`          | Requirements, user stories, MVP scope                 |
| `/agent-designer`    | Design system, screen layouts, component specs        |
| `/agent-dev-core`    | Main process, SQLite, IPC handlers                    |
| `/agent-dev-ui`      | React renderer, components, Zustand stores            |
| `/agent-dev-qa`      | QA checklist, build pipeline, electron-builder config |
| `/agent-orchestrate` | Coordinates parallel agent work, resolves conflicts   |

### Parallel Work with Conductor

Claude's Agent Teams feature requires a higher-tier plan. To achieve parallel agent execution on Claude Pro, this project uses **[Conductor](https://docs.conductor.build/)** — a Mac app that runs multiple Claude Code workspaces side by side.

Each agent runs in its own isolated workspace. They coordinate by reading and writing files under `.context/`, which acts as a shared communication layer between agents. This gives us genuine parallel development without stepping on each other's work.

### `.context/` — The Agent Coordination System

The `.context/` directory is how agents talk to each other across workspaces. It is version-controlled alongside the code.

```
.context/
├── current/           ← symlink to the active version (e.g. versions/v0.2)
├── versions/
│   ├── v0.1/          ← immutable snapshot of v0.1 agent outputs
│   │   ├── planning/  ← requirements, user stories, scope
│   │   ├── design/    ← design system, screens, components
│   │   ├── implementation/  ← IPC API contracts
│   │   └── qa/        ← QA checklist
│   └── v0.2/          ← v0.2 work in progress
│       └── ...
└── notes.md
```

**Versioning rule**: each product release gets its own directory under `versions/`. Past versions are immutable — never edited after the release boundary. At the start of a new version (e.g. v0.1 → v0.2), a new directory is created, the `current` symlink is updated to point to it, and agents write only to the new version.

All agents always read from and write to `current/` — they never need to know which version number is active.

**Agent execution order within a version**:

```
1. /agent-pm          → planning/
2. /agent-designer    → design/
3. /agent-dev-core    → src/main/  +  implementation/ipc-api.md
   /agent-dev-ui      → src/renderer/  (runs in parallel with dev-core)
4. /agent-dev-qa      → build config + qa/
```

Steps 3a and 3b can run in parallel because the IPC contract is frozen before both start — each agent knows exactly what interface it is building to or consuming.

---

## Roadmap

| Version | Focus                                                             |
| ------- | ----------------------------------------------------------------- |
| v0.1    | Core bookmark management — add, edit, delete, tag, search, import |
| v0.2    | Export, tag management, bulk operations, custom DB location       |
| Future  | Browser extension, cloud sync, mobile companion                   |

---

## License

MIT
