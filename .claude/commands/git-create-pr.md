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

3. **Verify checklist before creating the PR** — resolve each item now, not after:

   - **PR title format**: Validate against the regex in the Validation section below.
     Fix the title if it doesn't match. Do not proceed with an invalid title.

   - **Security review**: Scan the diff (`git diff origin/main..HEAD`) for security issues.
     Consult all rules in `.claude/rules/` relevant to the changed code.
     Mark `[x]` only after confirming no issues found.

   - **Related issues**: Check if any GitHub issue is relevant to these changes (`gh issue list`).
     If a related issue exists, add `Closes #<number>` to the PR body.
     If none exists, mark `[x]` and omit the closes reference.

4. **Push branch if needed**:
   ```bash
   git push -u origin HEAD
   ```

5. **Create PR** with all checklist items pre-verified and marked `[x]`:
   ```bash
   gh pr create --title "<type>(<scope>): <summary>" --body "$(cat <<'EOF'
   ## Summary

   <Describe what the PR does and how to test.>

   ## Changes

   -

   ## Checklist

   - [x] PR title follows conventional commit format
   - [x] Code reviewed for security issues
   - [x] Related issues linked (or confirmed none applicable)
   EOF
   )"
   ```

## Examples

```
feat(renderer): Add bookmark search with tag filtering
fix(main): Resolve SQLite connection leak on app quit
refactor(db): Extract repository interface for extensibility
chore(build): Update electron-builder packaging config
docs(shared): Update IPC channel naming conventions in CLAUDE.md
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
