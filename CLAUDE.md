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
├── .context/          # Agent collaboration files
└── CLAUDE.md
```

## Coding Conventions

- TypeScript strict mode
- Named exports only
- Shared types live in `src/shared/types.ts`
- IPC channel names defined in `src/shared/ipc-channels.ts`
- Repository pattern for all data access

## Documentation Language

- **All AI-generated documentation must be written in English** — applies to all files in `.context/`, `.claude/`, `docs/`, and any other project documentation
- This ensures consistency and readability across all agents
