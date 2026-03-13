# Git Commit

Stages and commits changes following the project's git conventions.

## Reference

Full conventions: `.claude/rules/git-conventions.md`

## Commit Message Format

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

## Steps

1. **Check what changed**:
   ```bash
   git status
   git diff
   ```

2. **Analyze changes** to determine the correct type and scope.

3. **Stage relevant files** (avoid staging unrelated or sensitive files):
   ```bash
   git add <specific files>
   ```

4. **Commit** using a heredoc to preserve formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <summary>
   EOF
   )"
   ```

5. **Verify**:
   ```bash
   git log --oneline -3
   ```

## Examples

```
feat(renderer): Add bookmark search with tag filtering
fix(main): Resolve SQLite connection leak on app quit
refactor(db): Extract repository interface for extensibility
chore(build): Update electron-builder packaging config
docs: Update IPC API reference in .context/current/implementation/ipc-api.md
feat(ipc)!: Rename bookmark channels to use domain prefix
```

## Breaking Changes

Add `!` before the colon and describe the breaking change:

```
feat(ipc)!: Rename bookmark channels to use domain prefix
```

$ARGUMENTS
