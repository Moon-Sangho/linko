---
model: claude-haiku-4-5-20251001
description: Stage and commit changes following the project's git conventions
---

# Git Commit

Stages and commits changes following the project's git conventions.

## Reference

Full conventions: `.claude/rules/conventions/references/git.md`

## Commit Message Format

```
<type>(<scope>): <summary>

<body>

<footer>
```

| Section | Required | Description |
|---------|----------|-------------|
| Header  | Yes | `<type>(<scope>): <summary>` — one line, max 72 chars |
| Body    | Recommended | What changed and why; bullet list preferred |
| Footer  | Optional | Issue references, breaking change notes |

Separate each section with a **blank line**.

---

### Types

| Type       | Description                         |
|------------|-------------------------------------|
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `perf`     | Performance improvement             |
| `test`     | Adding/correcting tests             |
| `docs`     | Documentation only                  |
| `refactor` | Code change (no bug fix or feature) |
| `build`    | Build system or dependencies        |
| `ci`       | CI configuration                    |
| `chore`    | Routine tasks, maintenance          |

### Scopes

| Scope      | Area                              |
|------------|-----------------------------------|
| `main`     | Electron main process             |
| `renderer` | React renderer process            |
| `shared`   | Shared types/IPC channels         |
| `db`       | SQLite database layer             |
| `ipc`      | IPC handlers                      |
| `build`    | electron-vite, electron-builder   |
| `ui`       | UI components                     |

### Body Rules

- Explain **what** changed and **why**, not how
- Use `-` bullet list for multiple changes
- Wrap at 72 characters per line
- Omit if header is self-explanatory

### Footer Keywords

```
Closes #<n>       ← closes an issue on merge
Refs #<n>         ← references without closing
See #<n>          ← informational link
BREAKING CHANGE:  ← breaking change description + migration guide
```

---

## Steps

1. **Check what changed**:
   ```bash
   git status
   git diff
   ```

2. **Analyze changes** — determine type, scope, and what to say in the body.

3. **Stage relevant files** (avoid staging unrelated or sensitive files):
   ```bash
   git add <specific files>
   ```

4. **Commit** using a single `-m` flag (no heredoc):
   ```bash
   git commit -m "<type>(<scope>): <summary>"
   # If a body is needed, append additional -m flags:
   git commit -m "<type>(<scope>): <summary>" -m "- <what changed and why>" -m "Closes #<n>"
   ```

5. **Verify**:
   ```bash
   git log --oneline -3
   ```

---

## Examples

```
feat(db): Add full-text search across bookmark fields

- Index url, title, and notes columns with FTS5
- Return ranked results sorted by relevance score
- Fall back to LIKE query on older SQLite builds

Closes #42
```

```
fix(main): Resolve SQLite connection leak on app quit

The db connection was not closed on 'before-quit', causing occasional
corruption on Windows.

Refs #37
```

```
feat(ipc)!: Rename bookmark channels to use domain prefix

- BOOKMARKS_GET → bookmark:get-all
- BOOKMARK_CREATE → bookmark:create

BREAKING CHANGE: All IPC channel names have changed. Update renderer
to use new constants from src/shared/ipc-channels.ts.
```

$ARGUMENTS
