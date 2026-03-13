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
```

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

### Summary Rules

- Imperative present tense: "Add" not "Added"
- Capitalize first letter
- No period at the end
- Under 72 characters total

### Examples

```
feat(renderer): Add bookmark search with tag filtering
fix(main): Resolve SQLite connection leak on app quit
refactor(db): Extract repository interface for extensibility
chore(build): Update electron-builder packaging config
docs: Update IPC API reference in .context/ipc-api.md
```

### Breaking Changes

Add `!` before the colon:

```
feat(ipc)!: Rename bookmark channels to use domain prefix
```
