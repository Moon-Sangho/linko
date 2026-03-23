# File Naming Conventions

All source files must use **kebab-case** naming.

## Rule

```
✅ bookmark-card.tsx
✅ use-bookmark-store.ts
✅ ipc-channels.ts

❌ BookmarkCard.tsx
❌ useBookmarkStore.ts
❌ IpcChannels.ts
```

Applies to all files under `src/` — components, hooks, stores, utilities, and test files.

---

## Why

GitHub (and macOS/Windows file systems) is case-insensitive.
If a file is already named `BookmarkCard.tsx` and you rename it to `bookmark-card.tsx`
through an editor or `mv`, Git will not detect the change — the old casing stays in the
remote repository and breaks imports on case-sensitive systems (Linux, CI).

Using kebab-case from the start avoids this problem entirely.

> If you ever need to rename an existing file with a casing change,
> use `git mv` instead of the editor or `mv`:
>
> ```bash
> git mv src/renderer/components/BookmarkCard.tsx src/renderer/components/bookmark-card.tsx
> ```

---

## Exceptions

| Path | Convention | Reason |
|------|-----------|--------|
| `CLAUDE.md`, `README.md` | UPPER_SNAKE | Community standard for root docs |
| `SKILL.md` | UPPER_SNAKE | Conductor skill index convention |
