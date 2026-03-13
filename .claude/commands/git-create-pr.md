---
model: claude-haiku-4-5-20251001
---

# Create Pull Request

Creates a GitHub PR with a conventional commit title.

## PR Title Format

```
<type>(<scope>): <summary>
```

### Types (required)

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

### Scopes (optional but recommended)

- `main` - Electron main process
- `renderer` - React renderer process
- `shared` - Shared types/IPC channels
- `db` - SQLite database layer
- `ipc` - IPC handlers
- `build` - Build config (electron-vite, electron-builder)
- `ui` - UI components

### Summary Rules

- Use imperative present tense: "Add" not "Added"
- Capitalize first letter
- No period at the end

## Steps

1. **Check current state**:
   ```bash
   git status
   git log origin/main..HEAD --oneline
   ```

2. **Analyze changes** to determine type, scope, and summary.

3. **Push branch if needed**:
   ```bash
   git push -u origin HEAD
   ```

4. **Create PR**:
   ```bash
   gh pr create --title "<type>(<scope>): <summary>" --body "$(cat <<'EOF'
   ## Summary

   <Describe what the PR does and how to test.>

   ## Changes

   -

   ## Checklist

   - [ ] PR title follows conventional commit format
   - [ ] Code reviewed for security issues
   - [ ] Related issues linked (closes #<issue-number>)
   EOF
   )"
   ```

## Examples

```
feat(renderer): Add bookmark search with tag filtering
fix(main): Resolve SQLite connection leak on app quit
refactor(db): Extract repository interface for extensibility
chore(build): Update electron-builder packaging config
docs: Update CLAUDE.md with new IPC channel conventions
```

## Validation

PR title must match:
```
^(feat|fix|perf|test|docs|refactor|build|ci|chore|revert)(\([a-zA-Z0-9]+\))?!?: [A-Z].+[^.]$
```

- Type must be one of the allowed types
- Scope is optional, must be in parentheses if present
- `!` before `:` for breaking changes
- Summary starts with capital letter, no trailing period

$ARGUMENTS
