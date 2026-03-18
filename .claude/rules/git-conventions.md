# Git Conventions

## Branch Naming

```
<type>/<short-description>
```

### Types

| Type       | Description                         | Example                              |
|------------|-------------------------------------|--------------------------------------|
| `feat`     | New feature                         | `feat/bookmark-search`               |
| `fix`      | Bug fix                             | `fix/sqlite-connection-leak`         |
| `perf`     | Performance improvement             | `perf/search-query-optimization`     |
| `test`     | Adding/correcting tests             | `test/ipc-handler-coverage`          |
| `docs`     | Documentation                       | `docs/agents-guide`                  |
| `refactor` | Code change (no bug fix or feature) | `refactor/bookmark-repository`       |
| `build`    | Build system or dependencies        | `build/electron-builder-config`      |
| `ci`       | CI configuration                    | `ci/github-actions-setup`            |
| `chore`    | Routine tasks, maintenance          | `chore/update-dependencies`          |

### Rules

- Use lowercase and hyphens only (no underscores, no camelCase)
- Keep descriptions short and specific
- Describe the thing being changed, not the action

### Examples

```
feat/tag-filtering
feat/browser-bookmark-import
fix/window-state-not-persisted
fix/search-returns-empty-results
docs/ipc-api-reference
refactor/url-fetcher-service
build/electron-vite-config
```

---

## Commit Message

```
<type>(<scope>): <summary>

<body>

<footer>
```

### Structure

| Section | Required | Description |
|---------|----------|-------------|
| Header  | Yes | `<type>(<scope>): <summary>` — one line |
| Body    | Recommended | What changed and why; bullet list preferred |
| Footer  | Optional | References, breaking change notes |

Separate each section with a **blank line**.

---

### Header

#### Types

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

#### Scopes

| Scope      | Area                              |
|------------|-----------------------------------|
| `main`     | Electron main process             |
| `renderer` | React renderer process            |
| `shared`   | Shared types/IPC channels         |
| `db`       | SQLite database layer             |
| `ipc`      | IPC handlers                      |
| `build`    | electron-vite, electron-builder   |
| `ui`       | UI components                     |

#### Scope Rules

- Omit the scope when it is identical to the type (e.g. use `build:` not `build(build):`)

#### Summary Rules

- Imperative present tense: "Add" not "Added"
- Capitalize first letter
- No period at the end
- Under 72 characters total (header line)

---

### Body

- Explain **what** changed and **why**, not how
- Use a bullet list (`-`) for multiple changes
- Wrap lines at 72 characters
- Omit if the header is self-explanatory (e.g. simple typo fix)

---

### Footer

Use for references and breaking change notices.

#### References

```
Closes #<issue-number>
Refs #<issue-number>
See #<issue-number>
```

#### Breaking Changes

```
BREAKING CHANGE: <description of what broke and how to migrate>
```

Also add `!` to the header:

```
feat(ipc)!: Rename bookmark channels to use domain prefix
```

---

### Full Example

```
feat(db): Add full-text search across bookmark fields

- Index url, title, and notes columns with FTS5
- Return ranked results sorted by relevance score
- Fall back to LIKE query on older SQLite builds

Closes #42
```

```
fix(main): Resolve SQLite connection leak on app quit

The db connection was not closed when the app received a 'before-quit'
event, causing occasional corruption on Windows.

Refs #37
```

```
feat(ipc)!: Rename bookmark channels to use domain prefix

- BOOKMARKS_GET → bookmark:get-all
- BOOKMARK_CREATE → bookmark:create
- BOOKMARK_DELETE → bookmark:delete

BREAKING CHANGE: All IPC channel names have changed. Renderer must be
updated to use the new channel constants from ipc-channels.ts.
```

```
docs: Restructure .context/ with versioned milestones and update agent paths

- Add current/{planning,design,implementation,qa}/ folder structure
- Add versions/v0.1/planning/ snapshot of PM outputs
- Update all agent commands to reference new .context paths
- Add git-commit command referencing git-conventions.md
```

---

## Commit Command Format

Always pass the commit message as a single `-m` string — **no heredoc, no line breaks**.

```bash
# ✅ Good — single-line -m flag
git commit -m "build(build): Support npm and yarn in addition to pnpm"

# ❌ Bad — heredoc causes JSON parse failure in PreToolUse hooks
git commit -m "$(cat <<'EOF'
build(build): Support npm and yarn in addition to pnpm
...
EOF
)"
```

**Why**: PreToolUse hooks receive the command as JSON. A heredoc with literal
newlines breaks JSON parsing, causing hooks to silently exit 0 and be bypassed.

Body and footer lines are omitted when the header is self-explanatory.
If a body is truly needed, append it as additional `-m` flags:

```bash
git commit -m "fix(db): Resolve connection leak on app quit" -m "The connection was not closed on before-quit, causing corruption."
```
